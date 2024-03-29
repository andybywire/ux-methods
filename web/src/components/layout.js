import React, { useEffect} from 'react';
import SideNav from './sideNav';
import Header from './header';
import Footer from './footer';
import {Helmet} from 'react-helmet';
import favicon from '../images/favicon.png';

const Layout = ({layoutClass, children}) => {

  useEffect(() => {
    // Mobile Nav — Open and close mobile menu:
    document.getElementById("openMenu").addEventListener("click", function () {
      document.getElementById("globalNav").style.transform = "translateX(0)";
    });
    document.getElementById("closeMenu").addEventListener("click", function () {
      document.getElementById("globalNav").style.transform = "translateX(100%)";
    });

    // Nav Dropdowns
    const dropdowns = document.getElementsByClassName("dropdown-toggle");
    for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].addEventListener("click", function () {
          if (this.classList.contains("show")) {
            this.classList.remove("show");
            setTimeout(() => this.parentNode.childNodes[1].style.display = "none", 500);
          } else {
            Array.from(dropdowns).forEach(dropdown => {
              dropdown.classList.remove("show");
              dropdown.parentNode.childNodes[1].style.display = "none";
              this.parentNode.childNodes[1].style.display = "list-item";
              setTimeout(() => this.classList.add("show"), 0);
            })
          }
        });
    };

    // Close dropdown when clicking outside of it
    const main = document.getElementsByTagName("main");
    main[0].addEventListener("click", function () {
      this.classList.add("test");
      for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].classList.remove("show");
      };
    });
  }, []);

  const staging = process.env.GATSBY_STAGING ? process.env.GATSBY_STAGING : false;

  console.log("Staging environment? " + process.env.GATSBY_STAGING);

  return (
    <>
      <Helmet>
          <title>UX Methods</title>
          <meta name="description" content="UX Methods is a community powered, linked data driven knowledge graph for learning about the techniques of user experience design." />
          {process.env.GATSBY_STAGING && 
          <meta name="robots" content="noindex, nofollow" />}
          <link rel="icon" href={favicon} type="image/png"></link>
      </Helmet>
      <a href='#main-content' className='show-on-focus'>Skip to Main Content</a>
      <Header />
      <SideNav />
      <main className={layoutClass} id='main-content'>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout
