import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
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
          <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://www.uxmethods.org/" target="blank"><AiFillLinkedin /></a>
          <a href="https://twitter.com/intent/tweet?url=https://www.uxmethods.org/&text=UX%20Methods%20is%20a%20community%20powered,%20linked%20data%20driven%20knowledge%20graph%20for%20learning%20about%20the%20techniques%20of%20user%20experience%20design." target="blank"><AiFillTwitterSquare /></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https://www.uxmethods.org/" target="blank"><AiFillFacebook /></a>
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
