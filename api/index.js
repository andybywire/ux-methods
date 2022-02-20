const express = require('express');
const cors = require("cors");
const BodyParser = require('body-parser');
const got = require('got');
const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-author')(),
  require('metascraper-publisher')(),
  require('metascraper-date')(),
  require('metascraper-description')()
]);

// Initialize Express & define a port
const app = express();
const port = 3030;

// Tell express to use body-parser's JSON parsing
// app.use(BodyParser.json());
app.use(BodyParser.text({ type: "text/plain" }));

/* CORS */
app.use(cors()); // Enable cors for all origins
// app.use(cors({
//   /** Use this when web frontend / production **/
//   // origin: 'https://example.com',

//   /** Use this when local frontend / development **/
//   origin: "http://localhost:3030",
// }));

app.get('/', (req, res) => {
  res.end('Hello World!');
});

app.get("/date", (req, res) => {
  const dateVar = new Date();
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(dateVar.toString());
});

app.post("/ld", (req, res) => {
  const response = JSON.parse(req.body);
  const submittedUrl = response.link;
  console.log(req.body);
  console.log(response.link);

  const targetUrl = submittedUrl;

  (async () => {
    try{
      const { body: html, url } = await got(targetUrl);
      const metadata = await metascraper({ html, url });
      console.log(metadata);
    } catch(e) {
      console.error(e);
    }
  })();

  res.status(200).end('Linked data request received.');
});


app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});