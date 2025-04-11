import * as React from 'react';
import Layout from '../components/layout';

const Offline = () => {
  return (
      <Layout layoutClass='index not-found'>
        <section className='headline'>
          <h1>Network Offline</h1>
          <p className='display'>It looks like there's a problem with the connection. Please check to make sure your network is online and try again.</p>
        </section>
      </Layout>
  );
}

export default Offline
