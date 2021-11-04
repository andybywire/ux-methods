import React from 'react';
import { Link } from 'part:@sanity/base/router';

export default {
  name: 'referencedInput',
  type: 'reference',
  title: 'Method Input',
  description: (
    <span>
      Choose an existing I/O term, or{' '}
      <Link href={'/intent/create/type=concept;template=concept/'}>add a new concept.</Link>
    </span>
  ),
  to: [{ type: 'concept'}]
}