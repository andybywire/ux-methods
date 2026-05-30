const method = {
  name: 'method',
  type: 'document',
  fields: [
    {name: 'title', type: 'string', validation: (R: any) => R.required()},
    {name: 'discipline', type: 'reference', to: [{type: 'discipline'}]},
  ],
}

export default method
