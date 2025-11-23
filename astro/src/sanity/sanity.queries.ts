import {defineQuery} from 'groq'

// Projection Fragments
const FOOTER_PROJECTION = `
  {
    "overview": coalesce(overview, []),
    "colophon": coalesce(colophon, [])
  }
`
// Query Fragments
const SITE_FOOTER_QUERY = `
  *[_id == "siteSettings"][0]  
  ${FOOTER_PROJECTION}
`

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
    "disciplinePreviews": *[_type == "discipline"]{
      title,
      "slug": slug.current,
      "uri": uri.current,
      "type": 'discipline',
      heroImage,
      metaDescription,
    },
    "footer": ${FOOTER_PROJECTION},
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
    "heroImage": coalesce(heroImage, {}),
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
    },
    "footer": ${SITE_FOOTER_QUERY},
  }
`)

export const ALL_METHODS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0]{
    "footer": ${FOOTER_PROJECTION},
    "methods": *[_type == "method"] {
      "title": coalesce(title, ''),
      "type": "method",
      "slug": slug.current,
      metaDescription,
      "heroImage": coalesce(heroImage, {}),
      "footer": ${SITE_FOOTER_QUERY},
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
    "heroImage": coalesce({
      "credit": heroImage.asset->creditLine,
      "source": heroImage.asset->source.url,
      "url": heroImage.asset->url,
      ...heroImage,
      }, {}),
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
    },
    "methodPreviews": *[_type == "method"]{
      title,
      "slug": slug.current,
      "uri": uri.current,
      "type": "method",
      heroImage,
      metaDescription,
    },
    "footer": ${SITE_FOOTER_QUERY},
  }
`)

export const DOCUMENTATION_QUERY = defineQuery(`
   *[_type == "documentation" && slug.current == $slug][0] {
      "title": coalesce(title, ''),
      "slug": slug.current,
      metaDescription,
      heroImage,
      body,
      "footer": ${SITE_FOOTER_QUERY},
    }
  `)
