import React from 'react'
import { graphql } from 'gatsby'
import * as s from './article.module.scss'
import Layout from '../components/layout'
import SanityImage from 'gatsby-plugin-sanity-image'
import PortableText from '../components/portableText'

export default function MethodPage({data:{article}}) {

  return (
    <Layout>
      <article className={s.article} >
          <div className={s.hero}>
            <SanityImage {...article.heroImage} width={500} alt=''/>
          </div>
          <div className={s.header}>
            <h1>{article.title}</h1>
          </div>
          <div className={s.body}>
            <PortableText blocks={article.body} />
          </div>
      </article>
    </Layout>
  )
}

export const query = graphql`
query($slug: String!) {
  article: sanityArticle (slug: {current: { eq: $slug }}) {
    title
    slug {
      current
    }
    metaDescription
    body: _rawBody(resolveReferences: {maxDepth: 10})
    heroImage {
      ...ImageWithPreview
      _rawAsset(resolveReferences: {maxDepth: 10})
    }
  }
}
`;
