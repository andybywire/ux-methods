// Minimal fixture document type — not using `defineType()` so the fixture
// has no dependency on the `sanity` package. The walker treats live
// schemaTypes objects and plain object literals identically because
// `defineType` is essentially an identity helper for TypeScript inference.

const discipline = {
  name: 'discipline',
  type: 'document',
  fields: [
    {name: 'title', type: 'string', validation: (R: any) => R.required()},
    {name: 'slug', type: 'slug'},
  ],
}

export default discipline
