import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'ldMetadata',
  title: 'Linked Data Metadata',
  type: 'object',
  description: 'Linked data metadata fields are used to manage linked data fetching and error messaging. These fields need to be available on the document in order of the Sanity function to use them, but you should not need to adjust them manually.',
  options: {
    collapsible: true,
    collapsed: true,
  },
  fields: [
    defineField({
      name: 'ldIsUpdating',
      description:
        'A Boolean that indicates that a LD update request has been sent to the LD function and is not yet resolved',
      type: 'boolean',
    }),
    defineField({
      name: 'ldLastUpdated',
      description: 'The time of the most recent update to the linked data of this resource',
      type: 'datetime',
    }),
    defineField({
      name: 'ldLastRequested',
      description:
        'The time of the most recent request to update the linked data of this resource',
      type: 'datetime',
    }),
    defineField({
      name: 'ldUpdateIssue',
      description: 'Records any issues encountered by the linked data lookup function.',
      type: 'string',
    }),
  ],
})