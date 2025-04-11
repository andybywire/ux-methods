
import imageUrl from '@sanity/image-url'
import { client } from '../utils/sanityClient.js';

/**
 * Image URL Builder
 * Returns a Sanity Image Asset Pipeline url that can be chained with 
 * imageBuilder methods. See https://www.sanity.io/docs/asset-pipeline/image-urls
 * for details.
*/
export default function urlFor(source) {
  return imageUrl(client).image(source)
}