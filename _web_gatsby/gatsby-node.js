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
      disciplines: allSanityDiscipline {
        nodes {
          title
          slug {
            current
          }
          uri {
            current
          }
        }
      }
      articles: allSanityArticle {
        nodes {
          title
          slug {
            current
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
  });
  result.data.disciplines.nodes.forEach(discipline => {
    createPage({
      path: `discipline/${discipline.slug.current}`,
      component: require.resolve(`./src/templates/discipline.js`),
      context: {
        slug: discipline.slug.current
      },
    })
  });
  result.data.articles.nodes.forEach(article => {
    createPage({
      path: `${article.slug.current}`,
      component: require.resolve(`./src/templates/article.js`),
      context: {
        slug: article.slug.current
      },
    })
  });
}
