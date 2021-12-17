import React from 'react';
import { Link } from 'gatsby';
import SanityImage from 'gatsby-plugin-sanity-image';
import Grid from './grid';
import * as s from './compactCard.module.scss';

const CompactCard = ({ content, gridStyle }) => {

  const cardStyle =
    (gridStyle === 'dark') ? [s.card, s.dark].join(' ') : s.card;

  return (
    <Grid style={gridStyle}>
    {content.map(resource => (
      <li className={cardStyle} key={resource.id}>
        <Link to={`/${resource._type}/${resource.slug.current}`}>
          <SanityImage {...resource.heroImage} width={100} alt=''/>
          <div>
            <h3>{resource.title}</h3>
            <p>{resource.metaDescription}</p>
          </div>
        </Link>
      </li>
    ))}
    </Grid>
  )
}

export default CompactCard
