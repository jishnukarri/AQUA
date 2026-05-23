# A.Q.U.A. Project - Ocean Waste Recognition Demo

## Overview
The A.Q.U.A. Project is an interactive web application designed to recognize and classify ocean waste using AI. It allows users to upload or search for images, analyze them, and view results with confidence scores and actionable recommendations.

## Features
1. **Image Upload**: Drag and drop images or browse files to upload.
2. **Image Search**: Search for ocean-related images online using the integrated Google Custom Search API.
3. **AI Analysis**: Classify images as ocean waste or marine life with confidence scores.
4. **Results Display**: View analysis results in grid or detailed views.
5. **Recommendations**: Get actionable insights based on the classification results.

## Project Structure
- `demo-script.js`: Main JavaScript functionality for the frontend.
- `demo-styles.css`: Styling for the web interface.
- `index.html`: Main HTML file for the web interface.
- `cors-server/`: Node.js server for handling CORS and API requests.
  - `index.js`: Server logic.
  - `package.json`: Server dependencies and configuration.
- `model/`: AI model files for TensorFlow.js integration.
  - `model.json`: Model architecture.
  - `metadata.json`: Metadata for the model.
  - `weights.bin`: Model weights.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/AQUA-Project.git
   ```
2. Navigate to the `cors-server` directory and add API keys and make necessary adjustments:
   - Obtain API keys from the following links:
     - [Google Custom Search API](https://developers.google.com/custom-search/v1/introduction)
     - [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all)
   - Update the following lines in `index.js`:
     ```javascript
     const API_KEY = '<your-api-key>';
     const CX = '<your-cx-key>';
     ```
   - Add your server IP and ports in the allowed origins section:
     ```javascript
     const allowedOrigins = [
       'http://<your-server-ip>:<port>',
       'http://<your-server-ip>:<port>',
     ];
     ```
3. Install dependencies:
   ```bash
   cd cors-server
   npm install
   ```
4. Start the CORS server:
   ```bash
   node index.js
   ```
5. Open `index.html` in a browser or deploy it to a web server.

## Usage
1. **Upload Images**: Drag and drop images into the upload area or click to browse files.
2. **Search Images**: Use the search bar to find ocean-related images online.
3. **Analyze Images**: Click the "Analyze Images" button to process selected images.
4. **View Results**: Review classification results, confidence scores, and recommended actions.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Google Custom Search API for image search functionality.
- TensorFlow.js for AI model integration.
