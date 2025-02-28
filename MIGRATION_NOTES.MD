Scripts from Lerna version of top-level `package.json`:

```
  "scripts": {
    "build": "lerna run build --parallel",
    "dev": "lerna run dev --parallel",
    "format": "lerna run format",
    "build-studio": "lerna bootstrap && cd studio && npm run build",
    "build-web": "lerna bootstrap && (cd studio && SANITY_AUTH_TOKEN=$SANITY_DEPLOY_STUDIO_TOKEN npm run graphql-deploy) && (cd web && npm run build)"
  },
```