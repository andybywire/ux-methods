function initMobileMenu() {
  const menuButton = document.getElementById('openMenu')
  const nav = document.querySelector('header nav ul')

  menuButton.addEventListener('click', () => {
    nav.classList.toggle('show')
    menuButton.setAttribute('aria-expanded', nav.classList.contains('show'))
  })

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header nav') && nav.classList.contains('show')) {
      nav.classList.remove('show')
      menuButton.setAttribute('aria-expanded', false)
    }
  })
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMobileMenu)
