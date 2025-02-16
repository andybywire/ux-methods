import {client} from './utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'
import {readFileSync} from 'fs'
import {join} from 'path'

// Load shared-output.csv
// This is a stopgap solution until the KG is back online, but we'll use a cached version
// as a backup going forward which could be something like this.
const sharedOutput = readFileSync(join(process.cwd(), '_data/kg-data/shared-output.csv'), 'utf-8')
  .split('\n')
  .map((row) => {
    const [origin, destination, sharedOutputCount] = row.split(',')
    return {origin, destination, sharedOutputCount}
  })

function prepareMethod(methods, methodPreviews) {
  const preparedMethods = methods.map((method) => {
    // Filter and assign methods preview list to previous methods
    const previousMethods = methodPreviews.filter((methodPreview) => {
      return sharedOutput.some((relationship) => {
        return relationship.origin === method.uri && relationship.destination === methodPreview.uri
      })
    })
    // Filter and assign methods preview list to next methods
    const nextMethods = methodPreviews.filter((methodPreview) => {
      return sharedOutput.some((relationship) => {
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
  // Prepare previews of all methods for previous and next methods sections
  const methodPreviews = methods.map((method) => {
    return {
      title: method.title,
      slug: method.slug,
      uri: method.uri,
      metaDescription: method.metaDescription,
    }
  })
  const preparedMethods = prepareMethod(methods, methodPreviews)
  return preparedMethods
}

export default getMethods
