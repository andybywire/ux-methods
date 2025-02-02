import {defineType} from 'sanity'

export default defineType({
  name: 'referencedDiscipline',
  type: 'reference',
  title: 'Disciplines', // subtitle in reference modal
  to: [{type: 'discipline'}],
})
