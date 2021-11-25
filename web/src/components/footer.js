import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import * as s from './footer.module.scss';
import PortableText from './portableText';
import CreativeCommons from '../images/svg/creativeCommons.svg';
import {AiFillLinkedin, AiFillTwitterSquare, AiFillFacebook} from 'react-icons/ai';

export default function Footer() {
  const {sanitySiteSettings: data} = useStaticQuery(
    graphql`
      query FooterQuery {
        sanitySiteSettings {
          title
          overview:_rawOverview(resolveReferences: {maxDepth: 10})
          colophon:_rawColophon(resolveReferences: {maxDepth: 10})
          social: _rawSocialMediaLinks(resolveReferences: {maxDepth: 10})
          credits: _rawCredits(resolveReferences: {maxDepth: 10})
        }
      }
    `);

  return (
    <footer>
      <section>
        <div className={s.overview}>
          <h1>{data.title}</h1>
          <PortableText blocks={data.overview} />
        </div>
        <div className={s.social}>
          <h1>Share This Project</h1>
          <a href="#"><AiFillLinkedin /></a>
          <a href="#"><AiFillTwitterSquare /></a>
          <a href="#"><AiFillFacebook /></a>
          {/*{data.social.map(({link}) => <p>{link}</p>)}*/}
        </div>
        <div className={s.colophon}>
          <h1>Colophon</h1>
          <PortableText blocks={data.colophon} />
        </div>
        <div className={s.credit}>
          {data.credits.map(({creditBody}) => <PortableText blocks={creditBody} />)}
          <CreativeCommons />
        </div>
      </section>
    </footer>
  );
}
