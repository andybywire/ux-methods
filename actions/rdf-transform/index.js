const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Test input defined in action.yml metadata file
  const testInput = core.getInput('test-input');
  console.log(`Test input is ${testInput}.`);
} catch (error) {
  core.setFailed(error.message);
}
