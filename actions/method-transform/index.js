const fs = require('fs')
const sanityClient = require('@sanity/client')
const client = sanityClient({
  projectId: '4g5tw1k0',
  dataset: 'production',
  apiVersion: '2021-03-25',
  token: '', // blank for unauthenticated usage
  useCdn: false, 
})

const query = `
  *[_type == $type]{
    title,
    "iri": uri.current,
    "hasInput": input[]->{
      "iriBase": conceptIriBase.iriValue,
      prefLabel
    },
    "hasOutput": output[]->{
      "iriBase": conceptIriBase.iriValue,
      prefLabel
    }
  }`
const params = {type: "method"}

let rdfData = ''

client.fetch(query, params)
  .then((method) => {
    method.forEach((method) => {
      let methodIri = method.iri;
      // if there are inputs, write them out as triples
      method.hasInput && method.hasInput.forEach(input => {
        rdfData += `<${methodIri}> <https://uxmethods.org/ontology/hasInput> <${input.iriBase + input.prefLabel.replaceAll(' ', '')}>.\n`;
      });
      // if there are outputs, write them out as triples
      method.hasOutput && method.hasOutput.forEach(output => {
        rdfData += `<${methodIri}> <https://uxmethods.org/ontology/hasOutput> <${output.iriBase + output.prefLabel.replaceAll(' ', '')}>.\n`;
      });
    })
  })
  .then(() => {
    try {
      fs.writeFileSync('rdfData.ttl', rdfData);
    } catch (error) {
      console.error('.ttl file write error: ', error.message)
    }
  })
  .catch((error) => {
    console.error('Upload failed:', error.message)
  })





// Using ESM (scroll to bottom):
// https://github.com/actions/github-script/issues/168

// Guide (including how to test locally):
// https://spacejelly.dev/posts/how-to-create-a-custom-github-action-with-node-javascript/
// run: `node index.js` in terminal