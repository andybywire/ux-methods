import {client} from '../utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'
import dotenv from 'dotenv'

// Load environment variables from .env.local in development only
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' })
}

// Ensure required environment variables are set
if (!process.env.KG_AUTH) {
  throw new Error('KG_AUTH environment variable is required')
}

// Transform SPARQL results into a more usable format
function transformKgData(kgData) {
  return kgData.results.bindings.map(binding => ({
    origin: binding.origin.value,
    destination: binding.destination.value,
    sharedOutputCount: parseInt(binding.sharedOutputCount.value),
    sharedOutput: binding.sharedOutput.value.split(',')
  }))
}

// Get shared output from KG
async function getSharedOutput() {
  const kgData = await fetch('https://fuseki.uxmethods.org/ds/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
      Authorization: 'Basic ' + btoa(process.env.KG_AUTH),
    },
    body: `
       PREFIX : <https://uxmethods.org/>
       PREFIX uxmo: <https://uxmethods.org/ontology/>

       SELECT ?origin ?destination (COUNT(?output) AS ?sharedOutputCount)
              (GROUP_CONCAT(DISTINCT ?output; SEPARATOR=",") AS ?sharedOutput)
       WHERE {
          ?origin uxmo:hasOutput ?output.
          ?destination uxmo:hasInput ?output.
       }
       GROUP BY ?origin ?destination
       ORDER BY DESC(?sharedOutputCount)
    `,
  })

  if (!kgData.ok) {
    throw new Error(`Failed to fetch from KG: HTTP error! status: ${kgData.status}`)
  }

  const data = await kgData.json()
  return transformKgData(data)
}

function prepareMethod(methods, methodPreviews, kgData) {
  const preparedMethods = methods.map((method) => {
    // Filter and assign methods preview list to previous methods
    // TODO: verify that mapping is weighted to prioritize strongest connections
    const previousMethods = methodPreviews.filter((methodPreview) => {
      return kgData.some((relationship) => {
        return relationship.destination === method.uri && relationship.origin === methodPreview.uri
      })
    })
    // Filter and assign methods preview list to next methods
    const nextMethods = methodPreviews.filter((methodPreview) => {
      return kgData.some((relationship) => {
        return relationship.origin === method.uri && relationship.destination === methodPreview.uri
      })
    })
    // Map serializers to Portable Text components and previous and next lists
    return {
      ...method,
      overview: toHTML(method.overview),
      steps: toHTML(method.steps),
      prepareMethods: previousMethods,
      continueMethods: nextMethods,
      // lede: toHTML(article.lede, { components: afcComponents }), // reminder for how components are added
    }
  })
  return preparedMethods
}

// Fetch methods from Sanity & prepare them for Eleventy
async function getMethods() {
  try {
    // Start both fetches in parallel
    const [methods, kgData] = await Promise.all([
      client.fetch(groq`
        *[_type == "method"] | order(title) {
            title,
            "type": "method",
            "slug": slug.current,
            "uri": uri.current,
            "createdAt": dateStamp.createdAt,
            "revisedAt": dateStamp.revisedAt,
            metaDescription,
            "heroImage": {
              "credit": heroImage.asset->creditLine,
              "source": heroImage.asset->source.url,
              "url": heroImage.asset->url,
              ...heroImage
             },
            overview,
            steps,
            stepSources,
            dateStamps,
            "outcomes": output[]->{
              prefLabel,
              definition,
            }, 
            "resources": *[_type == "resource" && references(^._id)]{
              title,
              author,
              resourceUrl,
              resourceImage,
              "publisher": publisher.pubName
            }
          }
        `),
      getSharedOutput()
    ])

    // Prepare previews of all methods
    const methodPreviews = methods.map((method) => ({
      title: method.title,
      slug: method.slug,
      uri: method.uri,
      type: 'method',
      heroImage: method.heroImage,
      metaDescription: method.metaDescription,
    }))

    // Process the data
    const preparedMethods = prepareMethod(methods, methodPreviews, kgData)
    return preparedMethods
  } catch (error) {
    console.error('Error in getMethods:', error)
    throw error
  }
}

export default getMethods
