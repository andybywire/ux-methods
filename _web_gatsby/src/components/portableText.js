import React from 'react';
import clientConfig from '../../client-config';
import serializers from './serializers';
import BasePortableText from '@sanity/block-content-to-react';

const PortableText = ({ blocks }) => (
  <BasePortableText
    blocks={blocks}
    serializers={serializers}
    {...clientConfig.sanity}
  />
);

export default PortableText;
