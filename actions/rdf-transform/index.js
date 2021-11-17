const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;

async function rdfFormat(sanityData) {
  try {
    // read data
    // let data = await fs.readFile(sanityData);
    // parse to JSON
    let jData = JSON.parse(sanityData);
    // create string variable to hold triples
    let rdfData = '';
    // build list with an IRI for each method title
    jData.result.forEach(method => {
        // assign current method in loop
        let currentMethod = `<https://uxmethods.org/method/${method.methodId}>`;
        // note preferred prefLabel
        (method => {rdfData += `${currentMethod}	<http://www.w3.org/2004/02/skos/core#prefLabel> "{method.title}".\n`;
        }();

        // if there are inputs, write them out as triples
        method.inputs && method.inputs.forEach(input => {
          rdfData += `${currentMethod} <https://uxmethods.org/ontology/hasInput> <https://uxmethods.org/${input.inputId}>.\n`;
        });
        // if there are outputs, write them out as triples
        method.outputs && method.outputs.forEach(output => {
          rdfData += `${currentMethod} <https://uxmethods.org/ontology/hasOutput> <https://uxmethods.org/${output.outputId}>.\n`;
        });
    });
    // write triples string variable to .ttl document
    await fs.writeFile('rdfData.ttl', rdfData);
  } catch (error) {
    // report any errors in the process
    console.error(`Got an error trying to convert to RDF: ${error.message}`);
  }
}

try {
  // Test input defined in action.yml metadata file
  const testInput = core.getInput('test-input');
  console.log(`Test input is ${testInput}.`);

  // Test data passed from Get Sanity Data step
  const sanityData = core.getInput('sanity-data');
    const sanityDataOutput = JSON.stringify(sanityData, null, 2);
    console.log(`Here is that data again ${sanityData}`);

  rdfFormat(sanityData);

} catch (error) {
  core.setFailed(error.message);
}
