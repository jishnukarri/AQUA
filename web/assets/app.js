/**
 * A.Q.U.A. Project - Ocean Waste Recognition Demo
 * Main JavaScript functionality
 */

let anime

// Initialize the application once the page has loaded
window.addEventListener('load', () => {
    const app = new OceanWasteAI();
    app.showCustomPopup('Demo Version', 'This is a demo version trained on 300 images per class.');
});

class OceanWasteAI {

/**
     * Show custom popup
     */
    showCustomPopup(title, message) {
        const popup = document.createElement('div');
        popup.className = 'custom-popup';

        popup.innerHTML = `
            <div class="popup-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <button class="popup-close">Close</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Add event listener to close button
        const closeButton = popup.querySelector('.popup-close');
        closeButton.addEventListener('click', () => {
            popup.remove();
        });

        // Close popup when clicking outside the content
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }
  constructor() {
    // Configuration
    this.apiBase = "api";
    this.searchEnabled = false;
    this.model = null;
    this.modelPromise = null;
    this.maxUploadSize = 5 * 1024 * 1024 // 5MB
    this.maxUploads = 10

    // State
    this.uploadedImages = []
    this.selectedSearchImages = []
    this.searchResults = []
    this.analysisResults = []
    this.isProcessing = false

    this.searchPrompts = [
      "ghost fishing nets",
      "derelict vessels at sea",
      "chemical runoff ocean",
      "oil spill cleanup",
      "sea bed litter",
      "microplastic fibers water",
      "plastic pellet spill",
      "abandoned crab pots",
      "tyre particles marine",
      "plastic foam pollution",
      "cosmetic microbeads sea",
      "plastic toothbrush ocean",
      "fishing line entanglement",
      "oil rig pollution",
      "sewage discharge sea",
      "sunken waste debris",
      "vessel scrubber discharge",
      "ship ballast water pollution",
      "deep sea mining waste",
      "bio-plastic degradation ocean",
      "plastic toothbrush bristles",
      "plastic cotton buds beach",
      "cotton bud sticks sea",
      "cigarette butts shoreline",
      "cigarette filter pollution",
      "tea bag mesh debris",
      "plastic pen fragments",
      "broken plastic toys",
      "plastic food packaging",
      "cling film fragments",
      "plastic sheet litter",
      "shredded plastic pieces",
      "plastic cable tie pollution",
      "lost fishing floats",
      "plastic ball buoy fragments",
      "six-pack ring entanglement",
      "plastic cutlery ocean",
      "plastic straw alternatives waste",
      "balloon debris sea",
      "latex balloon fragments",
      "foil packet pollution",
      "plastic blister packs",
      "plastic tray fragments",
      "dispenser cap pollution",
      "plastic laminate waste",
      "vinyl record fragments",
      "rubber duck spill",
      "plastic laundry capsule debris",
      "detergent pod particles",
      "UV degraded plastic fragments",
      "polystyrene foam bits",
      "plastic foamed packaging",
      "foam peanuts ocean",
      "styrofoam debris seabed",
      "insulation foam pollution",
      "construction plastic waste",
      "PVC pipe fragments",
      "plastic hose debris",
      "agricultural mulch film",
      "greenhouse plastic litter",
      "nursery pot fragments",
      "plastic plant tag debris",
      "rope fragment pollution",
      "synthetic rope layers",
      "nylon net scraps",
      "fishing gear fragments",
      "broken fishing rods",
      "lost fishing lures",
      "micro fishing hook hazards",
      "plastic fishing sinkers",
      "lead sinker debris",
      "metal fishing tackle",
      "glass bottle shards",
      "glass waste marine",
      "aluminum can pollution",
      "metal debris ocean",
      "steel drum spillage",
      "chemical barrel float",
      "pharmaceutical residue sea",
      "medicine container debris",
      "hospital waste sea",
      "cosmetic container pollution",
      "paint chip pollution",
      "anti-fouling paint flake",
      "ship paint debris",
      "vessel hull fragments",
      "ship wrap plastic",
      "container spill fragments",
      "lost shipping container debris",
      "sunken shipping debris",
      "vehicle parts marine",
      "tire fragment pollution",
      "automotive debris sea",
      "rubber tire particles",
      "synthetic rubber waste",
      "latex glove fragments",
      "nitrile glove debris",
      "disposable mask fragments",
      "PPE ocean pollution",
      "plastic respirator waste"
    ]
    
    this.marineLifePrompts = [
      "deep sea anglerfish",
      "hydrothermal vent community",
      "bioluminescent jellyfish",
      "migratory whale pods",
      "plankton bloom",
      "filter feeding whale",
      "reef fish spawning",
      "amphipod crustaceans",
      "sea cucumber habitat",
      "moray eel hiding",
      "dugong seagrass grazing",
      "clownfish and anemone",
      "lionfish invasion reef",
      "seagrass meadow",
      "mangrove root habitat",
      "pelagic tuna school",
      "penguins on ice",
      "seal colony beach",
      "sea otters kelp forest",
      "eelgrass ecosystem",
      "giant squid sighting",
      "viperfish deep sea",
      "gulper eel hunt",
      "ctenophore comb jelly",
      "siphonophore colony",
      "colossal squid tentacles",
      "pelican eel marine",
      "vampire squid ink",
      "sea spider underwater",
      "giant isopod on seafloor",
      "hagfish slime defense",
      "mantis shrimp strike",
      "sea star regeneration",
      "brittle star swarms",
      "ribbon worm motion",
      "copepod ecosystems",
      "amphioxus primitive chordate",
      "vent shrimp swarms",
      "blind cave fish",
      "lanternfish shoal",
      "arrow squid migration",
      "ribbon eel coral",
      "leafy seadragon camouflage",
      "weedy seadragon habitat",
      "pipefish seagrass",
      "lungfish swim behavior",
      "coelacanth rare sighting",
      "peanut worm burrowing",
      "sea whip coral community",
      "gorgonian coral reef",
      "fire coral stings",
      "soft coral underwater",
      "brain coral formation",
      "mushroom coral clusters",
      "sea fan gardens",
      "Christmas tree worm",
      "feather star on coral",
      "basket star on reef",
      "sea urchin grazing",
      "heart urchin burrow",
      "sea apple venom",
      "holothurian sea cucumber",
      "crown-of-thorns starfish",
      "cleaner shrimp mutualism",
      "porcelain crab shelter",
      "ornate ghost pipefish",
      "sea snake hunting",
      "yellow-bellied sea snake",
      "banded sea krait",
      "marine iguana basking",
      "African penguin dive",
      "emperor penguin colony",
      "southern rockhopper penguin",
      "Magellanic penguin",
      "sea turtle nesting beach",
      "leatherback turtle patrol",
      "hawksbill turtle feeding",
      "loggerhead turtle hatchling",
      "olive ridley turtle arribada",
      "Kemp's ridley turtle conservation",
      "frogfish camouflage reef",
      "cleaner fish station",
      "mutualistic cleaning interactions",
      "sea snake venom",
      "saltwater crocodile estuary",
      "manatee seagrass meadows",
      "dugong conservation status",
      "whale shark filter feeding",
      "reef manta ray barrel roll",
      "mobula ray dance",
      "blacktip reef shark",
      "bull shark river mouth",
      "tiger shark hunting",
      "hammerhead shark schooling",
      "sawfish ray habitat",
      "false killer whale pod",
      "pilot whale stranding",
      "orca hunting techniques",
      "bottlenose dolphin calf",
      "spinner dolphin aerial spin"
    ]
    // Initialize the application
    this.init()
  }

  async init() {
    try {
      console.log("Initializing Ocean Waste AI Demo...")

      // Set up event listeners
      this.setupEventListeners()

      // Generate random search suggestions
      this.generateSearchSuggestions()

      await this.checkSearchAvailability()

      console.log("Initialization complete")
    } catch (error) {
      console.error("Initialization failed:", error)
      this.showError("Initialization Failed", error.message)
    }
  }

  /**
   * Image search needs the backend. When the API key is not configured it is unavailable,
   * so the search tab is disabled and uploads remain fully functional.
   */
  async checkSearchAvailability() {
    try {
      const res = await fetch(`${this.apiBase}/health`)
      const data = res.ok ? await res.json() : null
      this.searchEnabled = Boolean(data && data.search)
    } catch {
      this.searchEnabled = false
    }
    if (this.searchEnabled) return

    document.getElementById("searchInput").disabled = true
    document.getElementById("searchBtn").disabled = true
    document.querySelector(".search-suggestions").innerHTML =
      '<p class="upload-note">Image search is unavailable in this deployment. Upload your own images instead, or self-host the full stack to enable search.</p>'
  }

  setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-btn")
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.tab
        this.switchTab(tabName)
      })
    })

    // Upload functionality
    const dropZone = document.getElementById("dropZone")
    const imageInput = document.getElementById("imageInput")

    dropZone.addEventListener("click", () => imageInput.click())
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault()
      dropZone.classList.add("dragover")
    })
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover")
    })
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault()
      dropZone.classList.remove("dragover")
      this.handleFileSelect(e.dataTransfer.files)
    })

    imageInput.addEventListener("change", (e) => {
      this.handleFileSelect(e.target.files)
    })

    // Button actions
    document.getElementById("analyzeBtn").addEventListener("click", () => this.analyzeImages())
    document.getElementById("clearBtn").addEventListener("click", () => this.clearImages())
    document.getElementById("searchBtn").addEventListener("click", () => this.performSearch())
    document.getElementById("randomSuggestionBtn").addEventListener("click", () => this.generateSearchSuggestions())

    // View switching
    document.getElementById("gridViewBtn").addEventListener("click", () => this.switchResultsView("grid"))
    document.getElementById("detailViewBtn").addEventListener("click", () => this.switchResultsView("detail"))

    // Modal controls
    document.getElementById("tutorialBtn").addEventListener("click", () => this.openModal("tutorialModal"))
    document.getElementById("aboutBtn").addEventListener("click", () => this.openModal("aboutModal"))
    document.getElementById("closeTutorialModal").addEventListener("click", () => this.closeModal("tutorialModal"))
    document.getElementById("closeAboutModal").addEventListener("click", () => this.closeModal("aboutModal"))
    document.getElementById("closeImageDetailModal").addEventListener("click", () => this.closeModal("imageDetailModal"))

    // Close modals when clicking outside
    const modals = document.querySelectorAll(".modal")
    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id)
        }
      })
    })

    // Search input
    const searchInput = document.getElementById("searchInput")
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch()
      }
    })
  }

  switchTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => {
      if (button.dataset.tab === tabName) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    // Update tab content
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      if (content.id === `${tabName}-tab`) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });

    // Ensure uploaded images section is visible on both tabs
    const uploadedImagesContainer = document.getElementById("uploadedImagesContainer");
    if (this.uploadedImages.length > 0) {
      uploadedImagesContainer.classList.remove("hidden");
    } else {
      uploadedImagesContainer.classList.add("hidden");
    }
  }

  handleFileSelect(files) {
    if (!files || files.length === 0) return

    // Check if we've reached the maximum number of uploads
    if (this.uploadedImages.length + files.length > this.maxUploads) {
      this.showError("Upload Limit", `You can only upload a maximum of ${this.maxUploads} images.`)
      return
    }

    // Process each file
    Array.from(files).forEach((file) => {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        this.showError("Invalid File", `${file.name} is not a valid image file.`)
        return
      }

      // Check file size
      if (file.size > this.maxUploadSize) {
        this.showError("File Too Large", `${file.name} exceeds the maximum file size of 5MB.`)
        return
      }

      // Create object URL for the file
      const imageUrl = URL.createObjectURL(file)

      // Add to uploaded images
      this.uploadedImages.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: file,
        url: imageUrl,
        name: file.name,
        type: "upload",
      })
    })

    // Update UI
    this.updateUploadedImagesUI()
    this.updateAnalyzeButton()
  }

  updateUploadedImagesUI() {
    const container = document.getElementById("uploadedImagesContainer")
    const imagesGrid = document.getElementById("uploadedImages")

    // Show container if we have images
    if (this.uploadedImages.length > 0) {
      container.classList.remove("hidden")
    } else {
      container.classList.add("hidden")
    }

    // Clear and rebuild the images grid
    imagesGrid.innerHTML = ""

    this.uploadedImages.forEach((image) => {
      const imageItem = document.createElement("div")
      imageItem.className = "uploaded-image-item"
      imageItem.dataset.id = image.id

      imageItem.innerHTML = `
                <img src="${image.url}" alt="${image.name}">
                <button class="remove-btn" data-id="${image.id}">
                    <i class="fas fa-times"></i>
                </button>
            `

      imagesGrid.appendChild(imageItem)
    })

    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll(".remove-btn")
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const imageId = button.dataset.id
        this.removeImage(imageId)
      })
    })
  }

  removeImage(imageId) {
    // Find the image
    const imageIndex = this.uploadedImages.findIndex((img) => img.id === imageId)

    if (imageIndex !== -1) {
      // Release object URL to free memory
      if (this.uploadedImages[imageIndex].url.startsWith("blob:")) {
        URL.revokeObjectURL(this.uploadedImages[imageIndex].url)
      }

      // Remove from array
      this.uploadedImages.splice(imageIndex, 1)

      // Update UI
      this.updateUploadedImagesUI()
      this.updateAnalyzeButton()
    }
  }

  clearImages() {
    // Release all object URLs
    this.uploadedImages.forEach((image) => {
      if (image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url)
      }
    })

    // Clear array
    this.uploadedImages = []

    // Update UI
    this.updateUploadedImagesUI()
    this.updateAnalyzeButton()
  }

  updateAnalyzeButton() {
    const analyzeBtn = document.getElementById("analyzeBtn")
    analyzeBtn.disabled = this.uploadedImages.length === 0
  }

  generateSearchSuggestions() {
    const suggestionTags = document.getElementById("suggestionTags")
    suggestionTags.innerHTML = ""

    // Combine and shuffle prompts
    const allPrompts = [...this.searchPrompts, ...this.marineLifePrompts]
    const shuffledPrompts = this.shuffleArray(allPrompts)

    // Take 5 random prompts
    const selectedPrompts = shuffledPrompts.slice(0, 5)

    // Create suggestion tags
    selectedPrompts.forEach((prompt) => {
      const tag = document.createElement("div")
      tag.className = "suggestion-tag"
      tag.textContent = prompt
      tag.addEventListener("click", () => {
        document.getElementById("searchInput").value = prompt
        this.performSearch()
      })

      suggestionTags.appendChild(tag)
    })
  }

  async performSearch() {
    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value.trim();
  
    if (query.length < 2) {
      this.showError("Invalid Search", "Please enter at least 2 characters for your search.");
      return;
    }
  
    try {
      const searchBtn = document.getElementById("searchBtn");
      const originalBtnText = searchBtn.innerHTML;
      
      searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      searchBtn.disabled = true;
  
      const response = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}&num=6`);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }
  
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error("Invalid API response format");
      }
  
      this.searchResults = data.results
        .filter(result => result.url && result.title)
        .map(result => ({
          // Simple random ID generation
          id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          url: result.url,
          thumbnail: result.thumbnail || this.fallbackImageUrl,
          title: result.title.substring(0, 100),
          type: "search",
          selected: false,
          context: result.context || "#"
        }));
  
      this.displaySearchResults();
  
    } catch (error) {
      console.error("Search failed:", error);
      this.showError("Search Failed", 
        error.message.includes("Failed to fetch") 
          ? "Connection to server failed. Check network status."
          : error.message
      );
    } finally {
      const searchBtn = document.getElementById("searchBtn");
      searchBtn.innerHTML = '<i class="fas fa-search"></i>';
      searchBtn.disabled = false;
    }
  }

  displaySearchResults() {
    const resultsContainer = document.getElementById("searchResults");
    const resultsGrid = document.getElementById("searchResultsGrid");

    // Show results container
    resultsContainer.classList.remove("hidden");

    // Clear and rebuild the results grid
    resultsGrid.innerHTML = "";

    if (this.searchResults.length === 0) {
      resultsGrid.innerHTML = '<p class="no-results">No results found. Try a different search term.</p>';
      return;
    }

    this.searchResults.forEach((result) => {
      const resultItem = document.createElement("div");
      resultItem.className = `search-result-item ${result.selected ? "selected" : ""}`;
      resultItem.dataset.id = result.id;

      resultItem.innerHTML = `
                <img src="${result.url || 'https://placehold.co/150x150?text=Image+Error'}" alt="${result.title}" onerror="this.src='https://placehold.co/150x150?text=Image+Error'">
                <div class="result-label">${result.title}</div>
                <button class="select-btn" data-id="${result.id}">
                    <i class="fas ${result.selected ? "fa-check" : "fa-plus"}"></i>
                </button>
            `;

      resultsGrid.appendChild(resultItem);
    });

    // Add event listeners
    const selectButtons = document.querySelectorAll(".select-btn");
    selectButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const resultId = button.dataset.id;
        this.toggleSearchResult(resultId);
      });
    });

    const resultItems = document.querySelectorAll(".search-result-item");
    resultItems.forEach((item) => {
      item.addEventListener("click", () => {
        const resultId = item.dataset.id;
        this.toggleSearchResult(resultId);
      });
    });

    // Animate results
    if (typeof anime !== "undefined") {
      anime({
        targets: ".search-result-item",
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
      });
    }
  }

  toggleSearchResult(resultId) {
    // Find the result
    const resultIndex = this.searchResults.findIndex((result) => result.id === resultId)

    if (resultIndex !== -1) {
      // Toggle selection
      this.searchResults[resultIndex].selected = !this.searchResults[resultIndex].selected

      // Update UI
      this.displaySearchResults()

      // If selected, add to uploaded images
      if (this.searchResults[resultIndex].selected) {
        const result = this.searchResults[resultIndex]

        // Check if already in uploaded images
        const existingIndex = this.uploadedImages.findIndex((img) => img.id === result.id)

        if (existingIndex === -1) {
          this.uploadedImages.push({
            id: result.id,
            url: result.url,
            thumbnail: result.thumbnail,
            name: result.title,
            type: "search",
          })
        }
      } else {
        // Remove from uploaded images
        const uploadIndex = this.uploadedImages.findIndex((img) => img.id === resultId)

        if (uploadIndex !== -1) {
          this.uploadedImages.splice(uploadIndex, 1)
        }
      }

      // Update uploaded images UI
      this.updateUploadedImagesUI()
      this.updateAnalyzeButton()
    }
  }

  async analyzeImages() {
    if (this.uploadedImages.length === 0) return

    try {
      // Show processing state
      this.isProcessing = true
      this.showProcessingState(true)

      // Process each image
      const results = []
      let processedCount = 0

      for (const image of this.uploadedImages) {
        // Update progress
        const progress = (processedCount / this.uploadedImages.length) * 100
        this.updateProcessingProgress(
          progress,
          `Processing image ${processedCount + 1} of ${this.uploadedImages.length}...`,
        )

        results.push(await this.classifyImage(image))

        processedCount++
      }

      // Complete progress
      this.updateProcessingProgress(100, "Analysis complete!")

      // Store results
      this.analysisResults = results

      // Wait a moment before showing results
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Display results
      this.displayAnalysisResults()
      this.updateStatistics()

      // Hide processing state
      this.showProcessingState(false)
      this.isProcessing = false
    } catch (error) {
      console.error("Analysis failed:", error)
      this.showError("Analysis Failed", error.message)

      // Hide processing state
      this.showProcessingState(false)
      this.isProcessing = false
    }
  }

  /**
   * Lazily load the Teachable Machine model (runs entirely in the browser).
   */
  loadModel() {
    if (!this.modelPromise) {
      this.modelPromise = window.tmImage
        .load("model/model.json", "model/metadata.json")
        .then((model) => (this.model = model))
        .catch((err) => {
          this.modelPromise = null
          throw new Error(`Could not load the classification model (${err.message})`)
        })
    }
    return this.modelPromise
  }

  loadImageElement(image) {
    // Search results go through the backend proxy so the canvas is not tainted by CORS.
    const src = image.type === "search" ? `${this.apiBase}/image-proxy?url=${encodeURIComponent(image.url)}` : image.url
    return new Promise((resolve, reject) => {
      const el = new Image()
      el.crossOrigin = "anonymous"
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error(`Could not load image "${image.name || image.url}"`))
      el.src = src
    })
  }

  async classifyImage(image) {
    const model = await this.loadModel()
    const el = await this.loadImageElement(image)
    const started = performance.now()
    const predictions = await model.predict(el)
    const processingTime = Math.round(performance.now() - started)

    const score = (name) => (predictions.find((p) => p.className === name)?.probability ?? 0) * 100
    const wasteConfidence = Math.round(score("Garbage"))
    const marineConfidence = 100 - wasteConfidence
    const isWaste = wasteConfidence >= marineConfidence

    return {
      id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageId: image.id,
      imageUrl: image.url,
      imageName: image.name,
      classification: isWaste ? "Ocean Waste" : "Marine Life",
      wasteConfidence,
      marineConfidence,
      processingTime,
      timestamp: new Date(),
      recommendations: this.generateRecommendations(isWaste),
    }
  }

  generateRecommendations(isWaste) {
    if (isWaste) {
      return [
        "Document location and type of waste for cleanup planning",
        "Organize targeted cleanup operation in this area",
        "Analyze waste composition for recycling potential",
        "Track potential sources to prevent future pollution",
        "Share data with environmental protection agencies",
      ]
    } else {
      return [
        "Document species and location for biodiversity studies",
        "Monitor this ecosystem for changes over time",
        "Protect this area from potential pollution sources",
        "Share data with marine conservation organizations",
        "Use as reference for healthy marine environments",
      ]
    }
  }

  showProcessingState(show) {
    const emptyState = document.getElementById("resultsEmptyState")
    const processingState = document.getElementById("processingState")
    const gridView = document.getElementById("resultsGridView")
    const detailView = document.getElementById("resultsDetailView")

    if (show) {
      emptyState.classList.add("hidden")
      processingState.classList.remove("hidden")
      gridView.classList.add("hidden")
      detailView.classList.add("hidden")
    } else {
      processingState.classList.add("hidden")
    }
  }

  updateProcessingProgress(percentage, statusText) {
    const progressBar = document.getElementById("analysisProgress")
    const statusElement = document.getElementById("processingStatus")

    progressBar.style.width = `${percentage}%`
    statusElement.textContent = statusText
  }

  displayAnalysisResults() {
    // Hide empty state
    document.getElementById("resultsEmptyState").classList.add("hidden")

    // Show the current view
    this.switchResultsView(document.getElementById("gridViewBtn").classList.contains("active") ? "grid" : "detail")
  }

  switchResultsView(viewType) {
    const gridViewBtn = document.getElementById("gridViewBtn")
    const detailViewBtn = document.getElementById("detailViewBtn")
    const gridView = document.getElementById("resultsGridView")
    const detailView = document.getElementById("resultsDetailView")

    if (viewType === "grid") {
      gridViewBtn.classList.add("active")
      detailViewBtn.classList.remove("active")

      gridView.classList.remove("hidden")
      detailView.classList.add("hidden")

      this.renderGridView()
    } else {
      detailViewBtn.classList.add("active")
      gridViewBtn.classList.remove("active")

      detailView.classList.remove("hidden")
      gridView.classList.add("hidden")

      this.renderDetailView()
    }
  }

  renderGridView() {
    const gridView = document.getElementById("resultsGridView")
    gridView.innerHTML = ""

    if (this.analysisResults.length === 0) {
      document.getElementById("resultsEmptyState").classList.remove("hidden")
      return
    }

    this.analysisResults.forEach((result) => {
      const resultCard = document.createElement("div")
      resultCard.className = "result-card"
      resultCard.dataset.id = result.id

      resultCard.innerHTML = `
                <div class="result-card-image">
                    <img src="${result.imageUrl}" alt="${result.imageName || "Analyzed image"}" onerror="this.src='https://placehold.co/150x150?text=Image+Error'">
                    <div class="result-card-badge ${result.classification === "Ocean Waste" ? "waste" : "marine"}">
                        ${result.classification}
                    </div>
                </div>
                <div class="result-card-content">
                    <h3 class="result-card-title">${result.imageName || "Analyzed image"}</h3>
                    <div class="result-card-confidence">
                        <span>${result.classification === "Ocean Waste" ? result.wasteConfidence : result.marineConfidence}%</span>
                        <div class="confidence-indicator">
                            <div class="confidence-indicator-fill ${result.classification === "Ocean Waste" ? "waste" : "marine"}" 
                                 style="width: ${result.classification === "Ocean Waste" ? result.wasteConfidence : result.marineConfidence}%"></div>
                        </div>
                    </div>
                </div>
            `

      gridView.appendChild(resultCard)

      // Add click event to open detail modal
      resultCard.addEventListener("click", () => {
        this.openImageDetailModal(result)
      })
    })

    // Animate cards
    if (typeof anime !== "undefined") {
      anime({
        targets: ".result-card",
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
      })
    }
  }

  renderDetailView() {
    const detailView = document.getElementById("resultsDetailView")
    detailView.innerHTML = ""

    if (this.analysisResults.length === 0) {
      document.getElementById("resultsEmptyState").classList.remove("hidden")
      return
    }

    this.analysisResults.forEach((result) => {
      const detailItem = document.createElement("div")
      detailItem.className = "result-detail-item"
      detailItem.dataset.id = result.id

      detailItem.innerHTML = `
                <div class="result-detail-image">
                    <img src="${result.imageUrl}" alt="${result.imageName || "Analyzed image"}" onerror="this.src='https://placehold.co/150x150?text=Image+Error'">
                </div>
                <div class="result-detail-content">
                    <div class="result-detail-header">
                        <h3 class="result-detail-title">${result.imageName || "Analyzed image"}</h3>
                        <div class="result-detail-badge ${result.classification === "Ocean Waste" ? "waste" : "marine"}">
                            ${result.classification}
                        </div>
                    </div>
                    <div class="result-detail-confidence">
                        <span class="result-detail-confidence-label">Waste Confidence:</span>
                        <div class="result-detail-confidence-bar">
                            <div class="result-detail-confidence-fill waste" style="width: ${result.wasteConfidence}%"></div>
                        </div>
                        <span class="result-detail-confidence-value">${result.wasteConfidence}%</span>
                    </div>
                    <div class="result-detail-confidence">
                        <span class="result-detail-confidence-label">Marine Confidence:</span>
                        <div class="result-detail-confidence-bar">
                            <div class="result-detail-confidence-fill marine" style="width: ${result.marineConfidence}%"></div>
                        </div>
                        <span class="result-detail-confidence-value">${result.marineConfidence}%</span>
                    </div>
                </div>
            `

      detailView.appendChild(detailItem)

      // Add click event to open detail modal
      detailItem.addEventListener("click", () => {
        this.openImageDetailModal(result)
      })
    })

    // Animate items
    if (typeof anime !== "undefined") {
      anime({
        targets: ".result-detail-item",
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
      })
    }
  }

  openImageDetailModal(result) {
    // Reset modal content to avoid conflicts
    const detailModal = document.getElementById("imageDetailModal");
    const detailImage = document.getElementById("detailImage");
    const detailModalTitle = document.getElementById("detailModalTitle");
    const detailClassification = document.getElementById("detailClassification");
    const detailConfidenceChip = document.getElementById("detailConfidenceChip");
    const wasteConfidenceValue = document.getElementById("wasteConfidenceValue");
    const marineConfidenceValue = document.getElementById("marineConfidenceValue");
    const wasteConfidenceBar = document.getElementById("wasteConfidenceBar");
    const marineConfidenceBar = document.getElementById("marineConfidenceBar");
    const detailExplanation = document.getElementById("detailExplanation");
    const recommendationsList = document.getElementById("detailRecommendations");

    // Clear previous content
    detailImage.src = "";
    detailModalTitle.textContent = "";
    detailClassification.textContent = "";
    detailConfidenceChip.textContent = "";
    wasteConfidenceValue.textContent = "";
    marineConfidenceValue.textContent = "";
    wasteConfidenceBar.style.width = "0%";
    marineConfidenceBar.style.width = "0%";
    detailExplanation.textContent = "";
    recommendationsList.innerHTML = "";

    // Set new content
    detailModalTitle.textContent = result.imageName || "Image Analysis";
    detailImage.src = result.imageUrl;
    detailClassification.textContent = result.classification;

    const confidence = result.classification === "Ocean Waste" ? result.wasteConfidence : result.marineConfidence;
    detailConfidenceChip.textContent = `${confidence}% Confidence`;
    detailConfidenceChip.className = "confidence-chip";
    if (confidence >= 85) {
      detailConfidenceChip.classList.add("high");
    } else if (confidence >= 70) {
      detailConfidenceChip.classList.add("medium");
    } else {
      detailConfidenceChip.classList.add("low");
    }

    wasteConfidenceValue.textContent = `${result.wasteConfidence}%`;
    marineConfidenceValue.textContent = `${result.marineConfidence}%`;
    wasteConfidenceBar.style.width = `${result.wasteConfidence}%`;
    marineConfidenceBar.style.width = `${result.marineConfidence}%`;

    detailExplanation.textContent = result.classification === "Ocean Waste"
      ? `This image has been classified as ocean waste with ${result.wasteConfidence}% confidence. The AI model has detected patterns, textures, and shapes consistent with human-made objects rather than natural marine elements. This type of waste can harm marine ecosystems and should be removed from the ocean environment.`
      : `This image has been classified as marine life with ${result.marineConfidence}% confidence. The AI model has detected natural patterns, colors, and shapes consistent with marine organisms rather than human-made waste objects. These natural elements are essential parts of healthy ocean ecosystems.`;

    result.recommendations.forEach((recommendation) => {
      const li = document.createElement("li");
      li.textContent = recommendation;
      recommendationsList.appendChild(li);
    });

    // Open modal
    this.openModal("imageDetailModal");
  }

  getImageSize(result) {
    // Try to get actual file size if available
    const image = this.uploadedImages.find((img) => img.id === result.imageId)
    if (image && image.file && image.file.size) {
      return image.file.size
    }

    // Otherwise return a random size between 100KB and 2MB
    return Math.floor(Math.random() * 1900000) + 100000
  }

  formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B"
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB"
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }
  }

  formatDate(date) {
    return date.toLocaleString()
  }

  updateStatistics() {
    // Count waste and marine objects
    let wasteCount = 0
    let marineCount = 0
    let totalConfidence = 0
    let totalProcessingTime = 0

    this.analysisResults.forEach((result) => {
      if (result.classification === "Ocean Waste") {
        wasteCount++
      } else {
        marineCount++
      }

      totalConfidence += result.classification === "Ocean Waste" ? result.wasteConfidence : result.marineConfidence
      totalProcessingTime += result.processingTime
    })

    // Calculate averages
    const avgConfidence =
      this.analysisResults.length > 0 ? Math.round(totalConfidence / this.analysisResults.length) : 0
    const avgProcessTime =
      this.analysisResults.length > 0 ? Math.round(totalProcessingTime / this.analysisResults.length) : 0

    // Update UI
    document.getElementById("wasteCount").textContent = wasteCount
    document.getElementById("marineCount").textContent = marineCount
    document.getElementById("avgConfidence").textContent = avgConfidence + "%"
    document.getElementById("avgProcessTime").textContent = avgProcessTime + "ms"

    // Animate the numbers
    if (typeof anime !== "undefined") {
      anime({
        targets: ["#wasteCount", "#marineCount", "#avgConfidence", "#avgProcessTime"],
        innerHTML: (el) => {
          return [0, el.innerHTML]
        },
        round: 1,
        easing: "easeInOutExpo",
        duration: 1500,
      })
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");

      // Animate modal content
      if (typeof anime !== "undefined") {
        anime({
          targets: `#${modalId} .modal-content`,
          translateY: [20, 0],
          opacity: [0, 1],
          easing: "easeOutQuad",
          duration: 300,
        });
      }
    } else {
      console.error(`Modal with ID '${modalId}' not found.`);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Animate modal content out
      if (typeof anime !== "undefined") {
        anime({
          targets: `#${modalId} .modal-content`,
          translateY: [0, 20],
          opacity: [1, 0],
          easing: "easeInQuad",
          duration: 200,
          complete: () => {
            modal.classList.remove("active");
          },
        });
      } else {
        modal.classList.remove("active");
      }
    } else {
      console.error(`Modal with ID '${modalId}' not found.`);
    }
  }

  showError(title, message) {
    alert(`${title}: ${message}`)
  }

  shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
}
