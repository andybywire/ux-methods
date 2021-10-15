import React from 'react';
import { Link } from 'part:@sanity/base/router';

export default     {
  name: 'referencedDiscipline',
  type: 'reference',
  title: 'Disciplines', // subtitle in reference modal
  description: (
    <span>
      Choose an existing discipline, or{' '}
      <Link href={'#'}>add a new discipline.</Link>
    </span>
  ),
  to: [{ type: 'discipline' }]
}
