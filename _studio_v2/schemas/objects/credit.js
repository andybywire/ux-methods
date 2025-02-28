export default {
  name: 'credit',
  title: 'Site Credit',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Credit',  
      type: 'string'
    },
    {
      name: 'creditBody',
      title: 'Site Credit Details',
      description: 'Add a brief description of and link to licenses and permissions.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'}
          ],
          lists: [],
          marks: {
            // Only allow these decorators
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'}
            ]
          }
        }
      ]
    }
  ]
}
