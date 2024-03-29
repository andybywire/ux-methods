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
      // assign preferred label
      rdfData += `<${methodIri}> <http://www.w3.org/2004/02/skos/core#prefLabel> "${method.title}".\n`;
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
