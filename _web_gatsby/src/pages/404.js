import * as React from 'react';
import { Link } from 'gatsby';
import Layout from '../components/layout';

const NotFoundPage = () => {
  return (
      <Layout layoutClass='index not-found'>
        <section className='headline'>
          <h1>404: Page Not Found</h1>
          <p className='display'>Sorry about that. It looks like the resource you're looking for has moved or does not exist.</p>
          <p className='display links'>Perhaps you'd like to <Link to='/'>head back home</Link>, or <Link to='/#site-search'>give search a whirl.</Link></p>
        </section>
      </Layout>
  );
}

export default NotFoundPage
