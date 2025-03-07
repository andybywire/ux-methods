// Add keys the keys and values defined in .env to process.env
// import 'dotenv/config'

// Filter & Shortcode imports
import basicHero from './_11ty/shortcodes/basicHero.js'
import basicImage from './_11ty/shortcodes/basicImage.js'

// Plugins
// import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // Pass through all assets (css, js, images, etc)
  eleventyConfig.addPassthroughCopy({ "_src/r/css": "r/css" });
  eleventyConfig.addPassthroughCopy({ "_src/r/js": "r/js" });

  // Shortcodes
  eleventyConfig.addShortcode('basicHero', basicHero)
  eleventyConfig.addShortcode('basicImage', basicImage)

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
