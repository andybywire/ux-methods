import React, { useEffect} from 'react'
import SideNav from './sideNav'
import Header from './header'
import Footer from './footer'

const Layout = ({ children }) => {

  useEffect(() => {
    // Mobile Nav
    // Open and close mobile menu
    document.getElementById("openMenu").addEventListener("click", function () {
      document.getElementById("globalNav").style.transform = "translateX(0)";
      // document.getElementById("navint").classList.add("open")
    });
    document.getElementById("closeMenu").addEventListener("click", function () {
      document.getElementById("globalNav").style.transform = "translateX(100%)";
    //   document.getElementById("navint").classList.remove("open")
    });

    // Mobile Nav Dropdowns
    const dropdowns = document.getElementsByClassName("dropdown-toggle");
    for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].addEventListener('click', function () {this.classList.toggle("show")});
    };

    // Close dropdown when clicking outside of it
    const main = document.getElementsByTagName("main");
    main[0].addEventListener('click', function () {
      this.classList.add("test");
      for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].classList.remove("show");
      };
    });

    // Consider switching this over to useState() for cleaner integration:
    // https://medium.com/skillthrive/build-a-react-accordion-component-from-scratch-using-react-hooks-a71d3d91324b
  });

  return (
    <>
      <Header />
      <SideNav />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout
