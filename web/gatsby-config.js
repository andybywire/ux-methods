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
      },
    },
    "gatsby-plugin-sass",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
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
  ],
};
