export default {
  name: 'transputReference',
  title: 'Input/Output',
  type: 'object',
  options: {
    columns: 2
  },
  fields: [
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
