import {defineQuery} from 'groq'

export const DISCIPLINES_QUERY = defineQuery(`
  *[_type == "discipline" && slug.current == $slug][0] {
    "title": coalesce(title,""),
    "type": "discipline",
    "slug": slug.current,
    "uri": uri.current,
    "createdAt": dateStamp.createdAt,
    "revisedAt": dateStamp.revisedAt,
    metaDescription,
    heroImage,
    overview,
    "methods": *[
        _type == "method" 
        && ^._id in disciplinesReference[]._ref
    ]{
      title, 
      "slug": slug.current,
      heroImage,
      "type": "method",
      metaDescription,
    }
  }
`)

export const METHODS_QUERY = defineQuery(`
  *[_type == "method" && slug.current == $slug][0] {
    "title": coalesce(title, ''),
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
`)
