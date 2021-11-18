import "./src/style/global.scss"

// Logs when the client route changes
export const onRouteUpdate = () => {

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
  // Looks like the timeout is needed for the dropdowns to load?
  setTimeout(()=> {
    var dropdowns = document.getElementsByClassName("dropdown-toggle");
    for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].addEventListener('click', function () {this.classList.toggle("show")});
    };
  }, 1000);
}
