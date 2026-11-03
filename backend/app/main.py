"""A.Q.U.A. backend: image search via the Hack Club Search API, a safe image proxy,
and static hosting for the web client."""

import ipaddress
import logging
import os
import re
import socket
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger("aqua")

SEARCH_URL = os.getenv("HACKCLUB_SEARCH_URL", "https://search.hackclub.com/res/v1/images/search")
SEARCH_API_KEY = os.getenv("HACKCLUB_SEARCH_API_KEY", "")
WEB_DIR = Path(os.getenv("WEB_DIR", Path(__file__).resolve().parents[2] / "web"))

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/bmp", "image/gif", "image/webp"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_REDIRECTS = 3
QUERY_PATTERN = re.compile(r"^[\w\s\-.,']+$")

app = FastAPI(title="A.Q.U.A. Ocean Waste Recognition", docs_url="/api/docs", openapi_url="/api/openapi.json")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "search": bool(SEARCH_API_KEY)}


@app.get("/api/search")
async def search(q: str = Query(..., min_length=2, max_length=200), num: int = Query(6, ge=1, le=20)) -> dict:
    if not SEARCH_API_KEY:
        raise HTTPException(503, "Image search is not configured (HACKCLUB_SEARCH_API_KEY is unset)")
    if not QUERY_PATTERN.match(q):
        raise HTTPException(400, "Invalid query format")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                SEARCH_URL,
                params={"q": q.strip(), "count": num, "safesearch": "strict"},
                headers={"Authorization": f"Bearer {SEARCH_API_KEY}", "Accept": "application/json"},
            )
    except httpx.HTTPError as exc:
        logger.warning("Search request failed: %s", exc)
        raise HTTPException(502, "Could not reach the search provider") from exc

    if resp.status_code == 429:
        raise HTTPException(429, "Search rate limit reached, try again shortly")
    if resp.status_code >= 400:
        logger.warning("Search provider returned %s: %s", resp.status_code, resp.text[:200])
        raise HTTPException(502, "Search provider error")

    results = []
    for item in resp.json().get("results", []):
        image_url = (item.get("properties") or {}).get("url") or (item.get("thumbnail") or {}).get("src")
        if not image_url:
            continue
        results.append(
            {
                "url": image_url,
                "title": item.get("title") or "Untitled",
                "thumbnail": (item.get("thumbnail") or {}).get("src"),
                "context": item.get("url"),
            }
        )
    return {"success": True, "results": results}


def _assert_public_host(url: str) -> None:
    """Reject anything that is not a plain http(s) URL pointing at a public address (SSRF guard)."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(400, "Invalid image URL")
    try:
        infos = socket.getaddrinfo(parsed.hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
    except socket.gaierror as exc:
        raise HTTPException(400, "Could not resolve image host") from exc
    for info in infos:
        if not ipaddress.ip_address(info[4][0]).is_global:
            raise HTTPException(400, "Image host is not allowed")


@app.get("/api/image-proxy")
async def image_proxy(url: str = Query(..., max_length=2048)) -> Response:
    """Fetch a remote image server-side so the browser can read its pixels (CORS)."""
    headers = {"User-Agent": "OceanGuardAI/2.0", "Accept": "image/*"}
    async with httpx.AsyncClient(timeout=10, follow_redirects=False) as client:
        for _ in range(MAX_REDIRECTS + 1):
            _assert_public_host(url)
            try:
                resp = await client.get(url, headers=headers)
            except httpx.HTTPError as exc:
                raise HTTPException(502, "Failed to fetch image") from exc
            if resp.is_redirect and "location" in resp.headers:
                url = urljoin(url, resp.headers["location"])
                continue
            break
        else:
            raise HTTPException(502, "Too many redirects")

    if resp.status_code != 200:
        raise HTTPException(502, "Failed to fetch image")
    content_type = resp.headers.get("content-type", "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(415, f"Unsupported image type: {content_type or 'unknown'}")
    if len(resp.content) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image too large")
    return Response(resp.content, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})


@app.exception_handler(HTTPException)
async def http_error(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse({"success": False, "error": exc.detail}, status_code=exc.status_code)


# Registered last so /api/* routes take precedence over the static catch-all.
app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
