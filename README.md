# A.Q.U.A. - Ocean Waste Recognition

A web application that classifies images as **ocean waste** or **marine life** using an image-classification model that runs entirely in the browser (TensorFlow.js). Images can be uploaded directly or found through built-in web image search.

## Features

- Drag-and-drop or file-picker image upload (up to 10 images, 5 MB each)
- Image search powered by the [Hack Club Search API](https://search.hackclub.com)
- In-browser inference with a Teachable Machine model; images never leave the client when uploaded
- Per-image confidence scores, grid and detail result views, and aggregate statistics
- Suggested follow-up actions for each classification

## Architecture

```
.
├── web/                  Static client (HTML, CSS, JS) and the TensorFlow.js model
│   └── model/            Teachable Machine export (model.json, weights.bin, metadata.json)
├── backend/app/main.py   FastAPI service: image search, image proxy, static hosting
├── Dockerfile
├── docker-compose.yml
└── run.sh                One-command launcher
```

The FastAPI service serves the web client and the API from a single port, so no CORS configuration is needed.

| Endpoint | Description |
| --- | --- |
| `GET /api/health` | Service status and whether search is configured |
| `GET /api/search?q=&num=` | Image search through the Hack Club Search API |
| `GET /api/image-proxy?url=` | Fetches a remote image so the browser can classify it (public hosts only, image types only, size-capped) |
| `GET /api/docs` | Interactive OpenAPI documentation |

## Getting started

Requirements: Docker with Compose (or Python 3.10+ for local mode).

```bash
git clone https://github.com/jishnukarri/OCEAN-GUARD-AI-Waste-Recognition.git
cd OCEAN-GUARD-AI-Waste-Recognition
./run.sh
```

On first run a `.env` file is created from `.env.example`. Add your Hack Club Search API key to enable image search, then run `./run.sh` again.

| Command | Action |
| --- | --- |
| `./run.sh` | Build and start the Docker stack |
| `./run.sh local` | Run with a local Python virtualenv, without Docker |
| `./run.sh stop` | Stop the Docker stack |

The app is served on `http://localhost:8000` by default.

### Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `HACKCLUB_SEARCH_API_KEY` | _(empty)_ | Search API key; image search is disabled when unset |
| `AQUA_PORT` | `8000` | Host port the app is published on |

### Self-hosting behind a reverse proxy

The container exposes a single HTTP port. Point your reverse proxy at `AQUA_PORT`; no path rewriting or extra headers are required.

## Model

The classifier is a Teachable Machine image model (224x224 input) with two classes, `Garbage` and `MarineLife`, trained on roughly 300 images per class. It is a demonstration model: accuracy on out-of-distribution images is limited.

## License

Released under the [MIT License](LICENSE).
