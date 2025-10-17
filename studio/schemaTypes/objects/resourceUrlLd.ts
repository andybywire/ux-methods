import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'resourceUrlLd',
  title: 'URL and Linked Data',
  type: 'object',
  fields: [
    defineField({
      name: 'resourceUrl',
      title: 'Resource URL',
      type: 'url',
    }),
    defineField({
      name: 'ldLastUpdated',
      description: 'The time of the most recent update to the linked data of this resource',
      type: 'datetime',
      hidden: true,
    }),
    defineField({
      name: 'ldLastRequested',
      description:
        'The time of the most recent request to update the linked data of this resource',
      type: 'datetime',
      hidden: true,
    }),
    defineField({
      name: 'ldIsUpdating',
      description:
        'A Boolean that indicates that a LD update request has been sent to the LD function and is not yet resolved',
      type: 'boolean',
      hidden: true,
    }),
    defineField({
      name: 'ldUpdateIssue',
      type: 'string',
      hidden: true,
    }),
  ],
})