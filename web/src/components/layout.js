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

    // Need to detect when focus leaves mobile nav & close panel. See:
    // https://stackoverflow.com/questions/13456530/detect-when-container-and-child-elements-lose-focus-with-jquery
    // https://www.reddit.com/r/angularjs/comments/48nmay/how_to_detect_blur_and_focus_element_on_the/

    // Nav Dropdowns
    const dropdowns = document.getElementsByClassName("dropdown-toggle");
    for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].addEventListener('click', function () {
          if (this.classList.contains("show")) {
            this.classList.remove("show");
          } else {
            Array.from(dropdowns).forEach(dropdown => dropdown.classList.remove("show"));
            this.classList.add("show");
          }
        });
    };
    // -> Closes open dropdown if a different one is clicked. Produces some unexpected behavior in specific (edge case) combinations on mobile. Work out bug when two nav lists are consolidated into one code block.

    // Close dropdown when clicking outside of it
    const main = document.getElementsByTagName("main");
    main[0].addEventListener('click', function () {
      this.classList.add("test");
      for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].classList.remove("show");
      };
    });
    // --> currently only works when clicking inside the "wrap".

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
