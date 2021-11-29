import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { getGatsbyImageData } from "gatsby-source-sanity";
import clientConfig from "../../client-config";

export const Figure = ({ node }) => {
  if (!node) {
    console.log('Images not returned. Boo.');
    return null;
  }
  const gatsbyImageData = getGatsbyImageData(
    node,
    { maxWidth: 675 },
    clientConfig.sanity
  );
  return (
    <figure>
      <GatsbyImage image={gatsbyImageData} alt={node.alt} />
      <figcaption>{node.caption}</figcaption>
    </figure>
  );
};
