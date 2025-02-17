// Add keys the keys and values defined in .env to process.env
// import 'dotenv/config'

// Filter & Shortcode imports
// TBD

// Plugins
// import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "_src/r/css": "r/css" });
  eleventyConfig.addPassthroughCopy({ "_src/r/js": "r/js" });
  
  // Watch all asset directories for changes
  eleventyConfig.addWatchTarget("_src/**/*");  // Watch everything in _src
  
  eleventyConfig.setServerOptions({
    showAllHosts: true,
  })

  return {
    htmlTemplateEngine: 'njk', 
    dir: {
      data: '../_data',
      input: '_src',
      includes: '../_includes',
      layouts: '../_layouts',
      output: '_site'
    },
  }
}
