import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Static adapter for GitHub Pages deployment
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
    paths: {
      // Update this to match your GitHub repository name
      // For example, if your repo is 'username/my-repo', set this to '/my-repo'
      // Leave as '' if deploying to username.github.io
      base: process.env.NODE_ENV === "production" ? "/vd26" : "",
    },
  },
};

export default config;
