import { RiSettings4Line } from 'react-icons/ri'

export default {
  name: 'siteSettings',
  title: 'Settings',
  icon: RiSettings4Line,
  type: 'document',
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3
    },
    {
      name: 'conceptSchemes',
      title: 'Taxonomy Settings',
      type: 'array',
      of: [{ type: 'conceptScheme'}]
    }
  ]
}
