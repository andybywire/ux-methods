import {client} from './utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'
import {readFileSync} from 'fs'
import {join} from 'path'

// Map serializers to Portable Text components
function prepareMethod(method) {
  return {
    ...method,
    overview: toHTML(method.overview),
    steps: toHTML(method.steps),
    // lede: toHTML(article.lede, { components: afcComponents }),
  }
}

// ############################################

// filter `methodPreviews` to include only those methods that are a "destination" for which the current method is an "origin" in the sharedOutput.json object
// add the filtered `methodPreviews` to the current method object as `nextMethods`


// load the shared-output.csv 
const sharedOutputString = readFileSync(join(process.cwd(), '_data/kg-data/shared-output.csv'), 'utf-8')

// load the shared-output.csv as a json object
const sharedOutput = sharedOutputString.split('\n').map(row => {
  const [origin, destination, sharedOutputCount] = row.split(',')
  return {origin, destination, sharedOutputCount}
})

// output example:
// {
//   origin: 'https://uxmethods.org/method/StakeholderInterviewing',
//   destination: 'https://uxmethods.org/method/JourneyMapping',
//   sharedOutputCount: '3'
// },



//  loop through the methodPreviews object and filter to include only those methods that are among the destination methods fo the provided origin method.
function getRelatedInputs(uri, sharedOutput) {
  const relatedInputs = sharedOutput.map(relationship => relationship.origin === uri)
  return relatedInputs
}



function getInputPreviews(methodPreviews, relatedInputs) {
  const inputPreviews = methodPreviews.filter(method => {
    return relatedInputs.includes(method.uri)
  })
  return inputPreviews
} 



function getRelatedMethods(methodPreviews, sharedOutput) {
  const relatedMethods = methodPreviews.map(output => {
    return sharedOutput.find(row => row.origin === method.uri && row.destination === output.uri)
  })
  return relatedMethods
}


// ############################################

// Fetch methods from Sanity & prepare them for Eleventy
async function getMethods() {
  const methods = await client.fetch(groq`
    *[_type == "method"] | order(title) {
      title,
      "slug": slug.current,
      "uri": uri.current,
      "createdAt": dateStamp.createdAt,
      "revisedAt": dateStamp.revisedAt,
      metaDescription,
      "heroImage": {
        "caption": heroImage.caption,
        "altText": heroImage.alt,
        "url": heroImage.asset->url,
      },
      overview,
      steps,
      "outcomes": output[]->{
        prefLabel,
        definition,
      }, 
    }
  `)

  const methodPreviews = methods.map(method => {
    return {
      title: method.title,
      slug: method.slug,
      uri: method.uri,
      metaDescription: method.metaDescription,
    }
  })
  
  const preparedMethods = methods.map(prepareMethod)
  return preparedMethods
}

export default getMethods
