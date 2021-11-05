const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Test input defined in action.yml metadata file
  const testInput = core.getInput('test-input');
  console.log(`Test input is ${testInput}.`);

  // Test data passed from Get Sanity Data step
  const sanityData = core.getInput('sanity-data');
    const sanityDataOutput = JSON.stringify(sanityData, null, 2);
    console.log(`Here is that data again ${sanityDataOutput}`);

    // const fs = require('fs');
    // const data = "This is the new content of the file.";
    // fs.writeFile('createdFile.txt', data, (err) => {
    //     if(err) {
    //         throw err;
    //     }
    //     console.log("Data has been written to file successfully.");
    // });

} catch (error) {
  core.setFailed(error.message);
}
