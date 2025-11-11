import {defineQuery} from 'groq'

// Site Metadata Fragments
const SITE_FOOTER_PROJECTION = `
  {
    "title": coalesce(title,""),
    "overview": coalesce(overview, []),
    "colophon": coalesce(colophon, [])
  }
`
const SITE_LAYOUT_PROJECTION = `
  {
    "title": coalesce(title,""),
  }
`
// Site Metadata Fragment Type
// This query isn't used directly, but it is used to type
// metadata fragments used in page-specific queries
export const SITE_METADATA_QUERY = defineQuery(`
  *[_id == "siteSettings"][0]{
    "layout": ${SITE_LAYOUT_PROJECTION},
    "footer": ${SITE_FOOTER_PROJECTION}
  }
`)

export const HOME_PAGE_QUERY = defineQuery(`
  *[_id == "siteSettings"][0]{
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
    },
    "metadata": {
      "layout": ${SITE_LAYOUT_PROJECTION},
      "footer": ${SITE_FOOTER_PROJECTION}
    }
  }
`)

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
