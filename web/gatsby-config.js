require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const clientConfig = require("./client-config");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  siteMetadata: {
    siteUrl: "https://www.uxmethods.org",
    title: "web",
  },
  plugins: [
    {
      resolve: "gatsby-source-sanity",
      options: {
        projectId: "4g5tw1k0",
        dataset: "production",
        watchMode: true,
        overlayDrafts: true,
        token: process.env.WEB_PREVIEW_TOKEN
      },
    },
    {
      resolve: "gatsby-source-remote-file",
      options: {
        url: "https://download.data.world/s/7fmfrnnh6emdyir57sgcsyamp2hmhx",
        name: "sharedTransput",
        ext: ".csv",
        errorHandling: "warn"
      },
    },
    {
      resolve: "gatsby-source-remote-file",
      options: {
        url: "https://download.data.world/s/rf7r5f64zntb63fe3mhauanr6mntn4",
        name: "methodCentrality",
        ext: ".csv",
        errorHandling: "warn"
      },
    },
    "gatsby-transformer-csv",
    "gatsby-plugin-sass",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `nunito sans\:100,200,300,400,500,600,700,800`,
          `hind\:100,200,300,400,500,600,700,800`
        ],
        display: 'swap'
      }
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-plugin-sanity-image",
      options: {
        projectId: "4g5tw1k0",
        dataset: "production",
        customImageTypes: ["SanityHeroImage"],
        __experimentalAspectRatio: true
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /svg/
        }
      }
    }
  ],
};
