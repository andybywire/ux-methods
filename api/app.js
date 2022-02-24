// Get environment variables
require('custom-env').env();
const uxmToken = process.env.UXM_TOKEN;
const projectId = process.env.PROJECT_ID;

// Import express and supporting packages
const express = require('express');
const cors = require("cors");
const fs = require('fs');
const BodyParser = require('body-parser'); 

// Initialize Express & define a port
const app = express();
const port = 8888;

const got = require('got');
const metascraper = require('metascraper')([
  require('metascraper-title')(),
  require('metascraper-author')(),
  require('metascraper-publisher')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')()
]);

const imgDownload = require('image-downloader');
const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: projectId,
  dataset: 'production',
  apiVersion: '2021-03-25',
  token: uxmToken
});


// Tell express to use body-parser's JSON parsing
// app.use(BodyParser.json());
app.use(BodyParser.text({ type: "text/plain" }));

/* CORS */
app.use(cors()); // Enable cors for all origins
// app.use(cors({
//   /** Use this when web frontend / production **/
//   origin: 'https://example.com',
//   /** Use this when local frontend / development **/
//   // origin: "http://localhost:3030",
// }));

app.get('/', (req, res) => {
  res.send('UX Methods API');
  res.send(process.version);
})

app.post("/ld", (req, res) => {
  const response = JSON.parse(req.body);
  const submittedUrl = response.link;
  const resourceId = response.resourceId;
  // console.log(response.link);
  // console.log(resourceId);

  const targetUrl = submittedUrl;

  (async () => {
    try{
      const { body: html, url } = await got(targetUrl);
      const metadata = await metascraper({ html, url });
      console.log(metadata);

      if(!fs.existsSync('./img')) {
        fs.mkdir('./img', { recursive: false }, (err) => {
            if (err) throw err;
        });
      }

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
            'Authorization': `Bearer ${process.env.UXM_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body:
            JSON.stringify(ldUpdate)
        }
      );

      const imgOptions = {
        url: metadata.image,
        dest: './img'           
      }

      const imageDownload = await imgDownload.image(imgOptions)
        .then(({ filename }) => {
          console.log('Saved to', filename);
          const imgName = filename.split('/')[1];
          // console.log(imgName);
          return imgName;
        })
        .catch((err) => console.error(err))

      console.log(imageDownload);

      // Upload image to Sanity   
      const filePath = 'img/' + imageDownload;

      console.log(filePath);

      const uploadImg = await client.assets
        .upload('image', fs.createReadStream(filePath), {
          filename: imageDownload  // basename(filePath)
        })
        .then(imageAsset => {
          // Here you can decide what to do with the returned asset document. 
          // If you want to set a specific asset field you can to the following:
          return client
            .patch(resourceId)
            .set({
              resourceImage: {
                _type: 'image',
                asset: {
                  _type: "reference",
                  _ref: imageAsset._id
                }
              }
            })
            .commit()
        })
        .then(() => {
          console.log("Done!");
        })
    

    } catch(e) {
      console.error(e);
    }
  })();

  res.status(200).end('Linked data request received.');
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});