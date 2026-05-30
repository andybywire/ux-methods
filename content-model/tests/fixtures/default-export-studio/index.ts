// Alternative fixture using `export default` rather than a named export.
// Many Sanity studios use this pattern; the loader supports both.

const sample = {
  name: 'sample',
  type: 'document',
  fields: [{name: 'title', type: 'string'}],
}

export default [sample]
