import {client} from '../utils/sanityClient.js'
import {toHTML} from '@portabletext/to-html'
import {readFileSync} from 'fs'
import {join} from 'path'
import groq from 'groq'

const rankedMethods = readFileSync(
  join(process.cwd(), '_data/kg-data/method-centrality.csv'),
  'utf-8',
)
  .split('\n')
  .map((row) => {
    const [method, label, centrality] = row.split(',')
    return {method, label, centrality}
  })

function prepareMetadata(metadata) {
  const rankedPreviews = metadata.methodPreviews.sort((a, b) => {
    const aRank = rankedMethods.findIndex((ranked) => ranked.label === a.title)
    const bRank = rankedMethods.findIndex((ranked) => ranked.label === b.title)
    return aRank - bRank
  })

  return {
    ...metadata,
    colophon: toHTML(metadata.colophon),
    overview: toHTML(metadata.overview),
    credits: metadata.credits.map((credit) => toHTML(credit.creditBody)),
    rankedMethods: rankedPreviews,
  }
}

async function getMetadata() {
  const metadata = await client.fetch(groq`
    *[_id == "siteSettings"]{
      title,
      tagline,
      description,
      overview,
      colophon,
      "credits": credits[]{
        creditBody
      },
      "methodPreviews": *[_type == "method"]{
        title,
        "slug": slug.current,
        "uri": uri.current,
        "type": 'method',
        heroImage,
        metaDescription,
      } 
    }[0]
  `)
  return prepareMetadata(metadata)
}

export default getMetadata
