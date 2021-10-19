import { RiNodeTree } from 'react-icons/ri'

export default {
  name: 'conceptScheme',
  title: 'Taxonomy Settings',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Scheme Name',
      type: 'string'
    },
    {
      name: 'schemeIri',
      title: 'Scheme IRI',
      type: 'string',
      description: 'The IRI is the unique identifier for the scheme.'
    },
    {
      name: 'baseUrl',
      title: 'Base URL',
      type: 'url',
      description: 'The base URL is combined with the Scheme IRI to form a full resolvable address.'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    }
  ],
  preview: {
    select: {
      title: 'title',
      iri: 'schemeIri',
      url: 'baseUrl'
    },
    prepare(selection) {
      const {title, iri, url} = selection
      return {
        title: title,
        subtitle: `${url}/${iri}`,
        media: RiNodeTree
      }
    }
  }
}
