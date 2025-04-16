// Add keys the keys and values defined in .env to process.env
// import 'dotenv/config'

// Filter & Shortcode imports
import responsiveHero from './_11ty/shortcodes/responsiveHero.js'
import resourceCard from './_11ty/shortcodes/resourceCard.js'
import resourceCardExt from './_11ty/shortcodes/resourceCardExt.js'

// Plugins
// import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // Pass through all assets (css, js, images, etc)
  eleventyConfig.addPassthroughCopy({'_src/r': 'r'});

  // Filters
  eleventyConfig.addFilter("prependPipe", (value) => ` | ${value}`);
  
  // Shortcodes
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addShortcode('responsiveHero', responsiveHero)
  eleventyConfig.addShortcode('resourceCard', resourceCard)
  eleventyConfig.addShortcode('resourceCardExt', resourceCardExt)

  // Bundles
  eleventyConfig.addBundle("jsonld");

  // Watch all asset directories for changes
  eleventyConfig.addWatchTarget('_src/**/*') // Watch everything in _src

  eleventyConfig.setServerOptions({
    showAllHosts: true,
  })

  return {
    htmlTemplateEngine: 'njk',
    dir: {
      data: '../_data',
      input: '_src',
      includes: '../_includes',
      layouts: '../_includes',
      output: '_site',
    },
  }
}
