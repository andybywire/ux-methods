import {defineQuery} from 'groq'

// Site Metadata Fragments
const SITE_FOOTER_QUERY = `
  *[_id == "siteSettings"][0]  
  {
    "title": coalesce(title,""),
    "overview": coalesce(overview, []),
    "colophon": coalesce(colophon, [])
  }
`
const SITE_LAYOUT_QUERY = `
  *[_id == "siteSettings"][0]
  {
    "title": coalesce(title,""),
  }
`
// Site Metadata Fragment Type
// This query isn't used directly, but it is used to type
// metadata fragments used in page-specific queries
export const SITE_METADATA_QUERY = defineQuery(`
  {
    "layout": ${SITE_LAYOUT_QUERY},
    "footer": ${SITE_FOOTER_QUERY}
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
    "disciplinePreviews": *[_type == "discipline"]{
      title,
      "slug": slug.current,
      "uri": uri.current,
      "type": 'discipline',
      heroImage,
      metaDescription,
    },
    "metadata": {
      "layout": ${SITE_LAYOUT_QUERY},
      "footer": ${SITE_FOOTER_QUERY}
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
    "metadata": {
      "layout": ${SITE_LAYOUT_QUERY},
      "footer": ${SITE_FOOTER_QUERY}
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
    "metadata": {
      "layout": ${SITE_LAYOUT_QUERY},
      "footer": ${SITE_FOOTER_QUERY}
    }
  }
`)
