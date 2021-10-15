export default {
  name: 'method',
  type: 'document',
  title: 'Method',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title'
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      validation: Rule => Rule.required(),
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Short Description',
      rows: 3,
      validation: Rule => Rule.required()
    },
    {
      name: 'heroImage',
      type: 'heroImage',
      title: 'Hero Image'
    },
    {
      name: 'disciplinesReference',
      type: 'array',
      title: 'Discipline(s)',
      description: 'List the disciplines in which this method is most commonly used.',
      of: [{ type: 'referencedDiscipline'}]
    },
    {
      name: 'overview',
      type: 'bodyPortableText',
      title: 'Method Overview'
    },
    {
      name: 'steps',
      type: 'bodyPortableText',
      title: 'Method Steps'
    },
    {
      name: 'inputsReference',
      type: 'array',
      title: 'Inputs to this Method',
      description: 'What evidence, insight, or recommendations are needed in order to use this method?',
      of: [{ type: 'referencedInput' }]
    },
    {
      name: 'outputReference',
      type: 'array',
      title: 'Outputs of this Method',
      description: 'What evidence, insight, or recommendations does this method produce?',
      of: [{ type: 'referencedOutput' }]
    }
  ]
}
