
import {client} from '../utils/sanityClient.js'
import groq from 'groq'

export default async function getDisciplines() {
  return await client.fetch(groq`
    *[_type == "discipline"] | order(title) {
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
    }
  `)
}
