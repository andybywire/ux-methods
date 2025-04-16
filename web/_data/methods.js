import {client} from '../utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import groq from 'groq'
import {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync} from 'fs'
import {join} from 'path'
import * as dotenv from 'dotenv'
// import { uxmComponents } from '../utils/serializers.js'

// Load environment variables from .env.local in development only
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' })
}

// Constants for fallback data
const FALLBACK_DIR = process.env.NODE_ENV === 'production' 
  ? '/var/www/uxm/fallback-data'
  : join(process.cwd(), '_data/fallback-data')
const FALLBACK_FILE = join(FALLBACK_DIR, 'kg-data.json')

// Clean up old fallback files in development
function cleanupFallbackData() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (existsSync(FALLBACK_DIR)) {
        // Get all fallback files sorted by modification time
        const files = readdirSync(FALLBACK_DIR)
          .filter(file => file.startsWith('kg-data-') && file.endsWith('.json'))
          .map(file => ({
            name: file,
            path: join(FALLBACK_DIR, file),
            time: statSync(join(FALLBACK_DIR, file)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time)

        // Keep only the 2 most recent files
        files.slice(2).forEach(file => {
          unlinkSync(file.path)
          console.log(`Removed old fallback file: ${file.name}`)
        })
      }
    } catch (error) {
      console.warn('Error cleaning up fallback data:', error.message)
    }
  }
}

// Get the most recent fallback file
function getMostRecentFallback() {
  try {
    if (existsSync(FALLBACK_DIR)) {
      const files = readdirSync(FALLBACK_DIR)
        .filter(file => file.startsWith('kg-data-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: join(FALLBACK_DIR, file),
          time: statSync(join(FALLBACK_DIR, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)

      if (files.length > 0) {
        return files[0].path
      }
    }
    return null
  } catch (error) {
    console.warn('Error finding most recent fallback:', error.message)
    return null
  }
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

// Get shared output from KG with fallback mechanism
async function getSharedOutput() {
  try {
    const kgData = await fetch('http://kg.uxmethods.org/repositories/uxm', {
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
      throw new Error(`HTTP error! status: ${kgData.status}`)
    }

    const data = await kgData.json()
    const transformedData = transformKgData(data)
    
    // Store successful response as backup
    const backupData = {
      timestamp: new Date().toISOString(),
      data: transformedData
    }
    
    // Only create directory and write files in development
    if (process.env.NODE_ENV !== 'production') {
      // Ensure fallback directory exists
      if (!existsSync(FALLBACK_DIR)) {
        mkdirSync(FALLBACK_DIR, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFile = join(FALLBACK_DIR, `kg-data-${timestamp}.json`)
      writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
      cleanupFallbackData()
    }
    
    return transformedData
  } catch (error) {
    console.warn('Failed to fetch from KG, attempting to use fallback data:', error.message)
    
    try {
      // Try to read fallback data
      const fallbackPath = process.env.NODE_ENV === 'production' 
        ? FALLBACK_FILE 
        : getMostRecentFallback()

      if (fallbackPath && existsSync(fallbackPath)) {
        const fallbackData = JSON.parse(readFileSync(fallbackPath, 'utf-8'))
        console.warn('Using fallback data from:', fallbackData.timestamp)
        return fallbackData.data
      }
      throw new Error('No fallback data available')
    } catch (fallbackError) {
      throw new Error(`Both KG fetch and fallback failed: ${fallbackError.message}`)
    }
  }
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
