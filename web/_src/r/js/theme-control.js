const hueSlider = document.getElementById('hue-slider');
const hueValue = document.getElementById('hue-value');
const colorToggle = document.getElementById('color-toggle');
const hueControl = document.getElementById('hue-control');
const chromaSlider = document.getElementById('chroma-slider');
const chromaValue = document.getElementById('chroma-value');
const chromaControl = document.getElementById('chroma-control');

// Initialize color controls as hidden
hueControl.style.display = 'none';
chromaControl.style.display = 'none';

// Get the current hue value from CSS custom properties
const currentHue = getComputedStyle(document.documentElement).getPropertyValue('--hue').trim();
hueSlider.value = currentHue;
hueValue.textContent = currentHue;

// Get the current chroma value from CSS custom properties
const currentChroma = getComputedStyle(document.documentElement).getPropertyValue('--chroma').trim();
chromaSlider.value = currentChroma;
chromaValue.textContent = Math.round((parseFloat(currentChroma) / 0.25) * 100);

// Set initial chroma to 0
document.documentElement.style.setProperty('--chroma', '0');

hueSlider.addEventListener('input', (e) => {
  const value = e.target.value;
  document.documentElement.style.setProperty('--hue', value);
  hueValue.textContent = value;
});

chromaSlider.addEventListener('input', (e) => {
  const value = e.target.value;
  document.documentElement.style.setProperty('--chroma', value);
  chromaValue.textContent = Math.round((parseFloat(value) / 0.25) * 100);
});

colorToggle.addEventListener('click', (e) => {
  const isPressed = e.target.getAttribute('aria-pressed') === 'true';
  e.target.setAttribute('aria-pressed', !isPressed);
  e.target.textContent = isPressed ? 'Off' : 'On';
  document.documentElement.style.setProperty('--chroma', isPressed ? '0' : '0.1');
  hueControl.style.display = isPressed ? 'none' : 'flex';
  chromaControl.style.display = isPressed ? 'none' : 'flex';
}); 