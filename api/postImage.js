// Get environment variables
require('custom-env').env();
const uxmToken = process.env.UXM_TOKEN;
const projectId = process.env.PROJECT_ID;

const imgDownload = require('image-downloader');
const sanityClient = require('@sanity/client');
const client = sanityClient({
  projectId: projectId,
  dataset: 'production',
  apiVersion: '2021-03-25',
  token: uxmToken
});

const fs = require('fs');

module.exports = async (req, res, next) => {
  try {
    const metadata = res.locals.resourceData;
    const response = JSON.parse(req.body);
    const resourceId = response.resourceId;
    // create a destination file for images in none exists
    if(!fs.existsSync('./img')) {
      fs.mkdir('./img', { recursive: false }, (err) => {
          if (err) throw err;
      });
    }

    const imgOptions = {
      url: metadata.image,
      dest: './img'           
    }

    const imageDownload = await imgDownload.image(imgOptions)
      .then(({ filename }) => {
        console.log('Saved to', filename);
        const imgName = filename.split('/')[1];
        return imgName;
      })
      .catch((err) => console.error(err))
    
    const filePath = 'img/' + imageDownload;
    
    const uploadImg = await client.assets
      .upload('image', fs.createReadStream(filePath), {
        filename: imageDownload  // basename(filePath)
      })
      .then(imageAsset => {
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
      // to do: should delete image from server after upload
  } catch (e) {
    console.error(e); 
  }
  res.status(200).end('Linked data posted to Sanity.');
}