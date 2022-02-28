const got = require('got');
const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-author')(),
  require('metascraper-publisher')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')()
]);

module.exports = async (req, res, next) => {
  try {
    const response = await JSON.parse(req.body);
    const targetUrl = response.link;
    const { body: html, url } = await got(targetUrl);
    const metadata = await metascraper({ html, url });
    res.locals.resourceData = metadata;
    next();
  } catch (e) {
    console.error(e);
  }
}