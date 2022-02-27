// Get environment variables
require('custom-env').env();
const uxmToken = process.env.UXM_TOKEN;
const projectId = process.env.PROJECT_ID;

const got = require('got');

module.exports = (req, res, next) => {
  (async () => {
    try {
      const metadata = res.locals.resourceData;
      const response = JSON.parse(req.body);
      const resourceId = response.resourceId;
      const ldUpdate = {
        mutations: [
          {
            patch: {
              id: resourceId,
              set: {
                title: metadata.title != null ? metadata.title : "",
                author: metadata.author != null ? metadata.author : "",
                publisher: {
                  pubName: metadata.publisher != null ? metadata.publisher : "",
                },
                pubDate: metadata.date != null ? metadata.date.split('T')[0] : "",
                metaDescription: metadata.description != null ? metadata.description : ""
              }
            }
          }
        ]
      };
      const updateLd = await got.post(
        `https://${projectId}.api.sanity.io/v2021-03-25/data/mutate/production`,
        {
          headers: {
            'Authorization': `Bearer ${uxmToken}`,
            'Content-Type': 'application/json'
          },
          body:
            JSON.stringify(ldUpdate)
        }
      );
      next();
    } catch (e) {
      console.error(e); 
    }
  })();
}