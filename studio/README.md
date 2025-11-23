# UX Methods Sanity Studio

## Extract schema to Sanity directory
`npx sanity schema extract --workspace production --path ./schema.json`

- run in the Studio directory
- this is used for automatic type generation in Astro
- future to do: set up so every time the schema changes, this re-runs


## Typegen

Generates TypeScript definitions from Sanity Studio schemas and GROQ queries and writes them to `../astro/src/sanity/sanity.types.ts`
- Generate new type definitions whenever the schema changes or when new GROQ queries are created:

```bash
npx sanity schema extract && npx sanity typegen generate
```

For future additions, consider:
- Adding a `sanity-typegen.json` to `astro/` to generate types from there (when queries change)
- Or, better yet, run typegen whenever a document in the "queries" directory changes
- [Adding scripts to `package.json`](https://www.buildwithmatija.com/blog/how-to-generate-typescript-types-for-your-sanity-v3-schema#adding-a-script-to-packagejson)

[Sanity Documentation](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen)

[Explainer + example of adding scripts to `package.json`](https://www.buildwithmatija.com/blog/how-to-generate-typescript-types-for-your-sanity-v3-schema#adding-a-script-to-packagejson)