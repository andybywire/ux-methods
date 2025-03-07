import {client} from './utils/sanityClient.js'
import groq from 'groq'

export default async function getMetadata() {
  return await client.fetch(groq`
    *[_id == "siteSettings"]{
      title,
      tagline,
      description
    }[0]
  `)
}
