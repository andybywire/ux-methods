# UX Methods Environments

## Preview SSR – https://preview.uxmethods.org
Drafts + live preview + overlays, SSR via Node/PM2.

Runtime env (PM2 / CI via GitHub secrets):
- PUBLIC_SANITY_VISUAL_EDITING_ENABLED="true"
- SANITY_API_READ_TOKEN=PREVIEW_SANITY_API_READ_TOKEN (GitHub secret)
- PUBLIC_ROBOTS_NOINDEX="true"  (don’t index preview)
- PUBLIC_SITE_ENV="preview" (optional, nice for a “Preview” badge)
- KG_AUTH=PREVIEW_KG_AUTH (GitHub secret, for the KG fetch)

Features:
- perspective: "drafts" in loadQuery
- Sanity stega & overlays
- Noindex meta tag (once wired in <Head>)

## Main SSG – https://uxmethods.org
Public, fast static site with published-only content.

Build-time env (GitHub Actions job that runs astro build):
- PUBLIC_SANITY_VISUAL_EDITING_ENABLED="false"
- PUBLIC_ROBOTS_NOINDEX="false" (indexable)
- PUBLIC_SITE_ENV="production"
- KG_AUTH=PROD_KG_AUTH (GitHub secret; used only at build time to talk to Fuseki)
- SANITY_API_READ_TOKEN unset (not needed for published-only)

There’s no Node runtime for SSG; nginx just serves the static files. So these vars only matter at build time, not on the server.

## Archive – https://2024.uxmethods.org
Frozen snapshot of the 2024 public site; no ongoing CI; has its own subdomain.

## Local dev modes
### .env.published.local (default)
- PUBLIC_SANITY_VISUAL_EDITING_ENABLED="false"
- PUBLIC_ROBOTS_NOINDEX="false"
- *SANITY_API_READ_TOKEN not needed*
- PUBLIC_SITE_ENV="local-published"

```bash
# TO DO: Set up in package.json scripts
cd astro
cp .env.published.local .env
pnpm dev
```

### .env.drafts.local (preview-like)
- PUBLIC_SANITY_VISUAL_EDITING_ENABLED="true"
- PUBLIC_ROBOTS_NOINDEX="false"
- SANITY_API_READ_TOKEN=sk-your-dev-token
- PUBLIC_SITE_ENV="local-preview"

```bash
# TO DO: Set up in package.json scripts
cd astro
cp .env.drafts.local .env
pnpm dev
```


# Astro Starter Kit: Basics

```sh
pnpm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
