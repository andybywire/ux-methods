exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allSanityMethod {
        edges {
          node {
            title
            slug {
              current
            }
            uri {
              current
            }
          }
        }
      }
    }
  `)

  result.data.allSanityMethod.edges.forEach(({ node }) => {
    createPage({
      path: `method/${node.slug.current}`,
      component: require.resolve(`./src/templates/method.js`),
      context: {
        slug: node.slug.current,
        uri: node.uri.current
      },
    })
  })
}
