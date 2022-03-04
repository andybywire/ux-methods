// Import express and supporting packages
const express = require('express');
const BodyParser = require('body-parser'); 
const cors = require("cors");

// Import route handlers
const getLD = require('./getLinkedData');
const postLD = require('./postLinkedData');
const postImg = require('./postImage');

// Initialize Express & define a port
const app = express();
const port = 8888;

// Configure Express middleware
app.use(BodyParser.text({ type: "text/plain" }));
app.use(cors()); // Allow CORS for all origins. Origin restrictions are currently set in routes.

// API stats at bare subdomain url
app.get('/', (req, res) => {
  const updated = new Date();
  const message = `<p>UX Methods API • Node ${process.version}</p>
                   <p>Last updated: ${updated}</p>`;
  res.send(message)
})

// UX Methods Resources Linked Data API
app.post("/ld", [getLD, postLD, postImg])

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});