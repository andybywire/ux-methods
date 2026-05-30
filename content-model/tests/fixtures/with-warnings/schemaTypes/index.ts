// Fixture that triggers a cross-class field-type collision warning. Both
// documents declare a `body` field but with structurally different types
// (PortableText vs plain string). The walker emits a warning per ADR 0006.

const documentation = {
  name: 'documentation',
  type: 'document',
  fields: [{name: 'body', type: 'array', of: [{type: 'block'}]}],
}

const newsletter = {
  name: 'newsletter',
  type: 'document',
  fields: [{name: 'body', type: 'string'}],
}

export const schemaTypes = [documentation, newsletter]
