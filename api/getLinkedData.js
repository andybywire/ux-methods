const got = require('got');
const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-author')(),
  require('metascraper-publisher')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')()
]);

// Specify origins allowed to access this function
const allowedOrigin = (process.env.NODE_ENV == "development") ? "http://localhost:3333" : "https://cms.uxmethods.org";

module.exports = async (req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin == allowedOrigin) {
    try {
      console.log("Originating URL is: " + requestOrigin);
      const response = await JSON.parse(req.body);
      const targetUrl = response.link;
      const { body: html, url } = await got(targetUrl);
      const metadata = await metascraper({ html, url });
      res.locals.resourceData = metadata; // writes metadata to a local object to pass to the next handler
      next(); // pass control to the next handler
    } catch (e) {
      console.error(e);
    }
  } else { // Boot out any origins not on my allowed list.
    console.log("Unauthorized origin. Originating URL is: " + requestOrigin);
    res.status(401).end('Unauthorized origin.');
  }
}