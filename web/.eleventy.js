// Add keys the keys and values defined in .env to process.env
// import 'dotenv/config'

// Filter & Shortcode imports
// TBD

// Plugins
// import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // eleventyConfig.addPassthroughCopy('.htaccess')
  // eleventyConfig.addPassthroughCopy('style')
  // eleventyConfig.addPassthroughCopy('assets')
  // eleventyConfig.addPassthroughCopy('serviceworker.js')
  // eleventyConfig.addPassthroughCopy({'assets/js': 'js'})
  // eleventyConfig.addPassthroughCopy({'assets/icons': 'icons'})
  // eleventyConfig.addPassthroughCopy('manifest.json')
  // eleventyConfig.addPassthroughCopy('robots.txt');

  // Shortcodes
  // eleventyConfig.addShortcode('responsiveImage', responsiveImage)
  // eleventyConfig.addShortcode('imageUrlFor', imageUrlFor)

  // Filters
  // eleventyConfig.addFilter('date', dateFilter) // Moment.js

  // RSS feed
  // eleventyConfig.addPlugin(pluginRss)

  eleventyConfig.setServerOptions({
    // watch: ['style/**/*.css'],
    showAllHosts: true,
  })

  return {
    htmlTemplateEngine: 'njk',
    dir: {
      data: '../_data',
      input: '_src',
      includes: '../_includes',
      layouts: '../_layouts',
    },
  }
}
