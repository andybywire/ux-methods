import {defineType} from 'sanity'

export default defineType({
  name: 'describedMethod',
  type: 'reference',
  title: 'Method',
  to: [{type: 'method'}],
})
