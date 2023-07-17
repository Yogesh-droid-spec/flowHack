// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const path = require('path');
const url = require('url');

// Get the URL of the preload.js file.
const preloadUrl = url.parse(document.currentScript.src).href;

// Preload the URL that was passed to the preload.js file.
require(path.join(preloadUrl, 'http://localhost:3000'));

