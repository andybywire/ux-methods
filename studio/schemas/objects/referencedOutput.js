import React from 'react';
import { Link } from 'part:@sanity/base/router';

export default {
  name: 'referencedOutput',
  type: 'reference',
  title: 'Method Output',
  description: (
    <span>
      Choose an existing I/O term, or{' '}
      <Link href={'#'}>add a new concept.</Link>
    </span>
  ),
  to: [{ type: 'concept'}]
}
