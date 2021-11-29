import React from 'react'
import SanityImage from 'gatsby-plugin-sanity-image'
import Grid from './grid'
import * as s from './compactCard.module.scss'
import { FiExternalLink } from 'react-icons/fi'

const ResourceCard = ({ content }) => {
  return(
    <Grid>
    {content.map(resource => (
      <li className={[s.card, s.resource].join(' ')} key={resource.id}>
        <a href={resource.resourceUrl}>
          <SanityImage {...resource.resourceImage} width={500} alt=''/>
          <div>
            <h3>{resource.title}</h3>
            <p><span>{resource.author ? resource.author + ' | ':'' }{resource.publisher.pubName}</span><span><FiExternalLink /></span></p>
          </div>
        </a>
      </li>
    ))}
    </Grid>
  )
}

export default ResourceCard
