require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const clientConfig = require("./client-config"); // may not be necessary, since I'm using dotenv

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  siteMetadata: {
    siteUrl: `https://uxmethods.org`,
    title: `UX Methods`,
  },
  plugins: [
    {
      resolve: `gatsby-source-sanity`,
      options: {
        projectId: `4g5tw1k0`,
        dataset: `production`,
        watchMode: true, // !isProd, --> sets watchMode only in developmnet
        overlayDrafts: true,
        token: process.env.WEB_PREVIEW_TOKEN
      },
    },
    {
      resolve: `gatsby-source-remote-file`,
      options: {
        url: `https://download.data.world/s/7fmfrnnh6emdyir57sgcsyamp2hmhx`,
        name: `sharedOutput`,
        ext: `.csv`,
        errorHandling: `warn`
      },
    },
    {
      resolve: `gatsby-source-remote-file`,
      options: {
        url: `https://download.data.world/s/rf7r5f64zntb63fe3mhauanr6mntn4`,
        name: `methodCentrality`,
        ext: `.csv`,
        errorHandling: `warn`
      },
    },
    `gatsby-transformer-csv`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-image`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-plugin-html-attributes',
      options: {
        lang: `en`,
        prefix: `og: https://ogp.me/ns#`
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        lang: `en`,
        name: `UX Methods`,
        short_name: `UX Methods`,
        description: `UX Methods is a community powered, linked data driven knowledge graph for learning about the techinques of user experience design.`,
        theme_color: `#182125`,
        background_color: `#28B7FF`,
        display: `minimal-ui`,
        start_url: `/`,
        icon: `src/images/pwa_icon.png`, // not maskable; condider adding in the future
        include_favicon: false,
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [`/index.html`,`/about/index.html`, `/offline/index.html`],
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          "nunito sans\:100,200,300,400,500,600,700,800",
          "hind\:100,200,300,400,500,600,700,800"
        ],
        display: 'swap'
      }
    },
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: `GTM-MRLDV3L`,
        defaultDataLayer: { platform: "gatsby" },
        enableWebVitalsTracking: true,
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `./src/images/`,
      },
      __key: `images`,
    },
    {
      resolve: `gatsby-plugin-sanity-image`,
      options: {
        projectId: `4g5tw1k0`,
        dataset: `production`,
        customImageTypes: ["SanityHeroImage"],
        __experimentalAspectRatio: true
      },
    },
    {
      resolve: `gatsby-plugin-react-svg`,
      options: {
        rule: {
          include: /svg/
        }
      }
    },
    {
      resolve: `gatsby-plugin-local-search`,
      options: {
        name: `pages`,
        engine: `flexsearch`,
        query: `
          query {
            allSanityMethod {
              nodes {
                id
                title
                metaDescription
                _type
                slug {
                  current
                }
                _rawOverview
              }
            }
            allSanityDiscipline {
              nodes {
                id
                title
                metaDescription
                _type
                slug {
                  current
                }
                _rawOverview
              }
            }
          }
        `,
        ref: `id`,
        index: ["title", "excerpt", "overview"],
        store: ["title", "excerpt", "type", "slug"],
        normalizer: ({ data }) =>
          data.allSanityMethod.nodes.map((node) => ({
            id: node.id,
            title: node.title,
            excerpt: node.metaDescription,
            type: node._type,
            slug: node.slug.current,
            overview: node._rawOverview
          })).concat(
            data.allSanityDiscipline.nodes.map((node) => ({
              id: node.id,
              title: node.title,
              excerpt: node.metaDescription,
              type: node._type,
              slug: node.slug.current,
              overview: node._rawOverview
            }))
          )
      }
    }
  ],
};
