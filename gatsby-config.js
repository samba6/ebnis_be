/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");

let plugins = [
  "gatsby-plugin-typescript",

  {
    resolve: "gatsby-plugin-alias-imports",
    options: {
      alias: {
        "../../theme.config": path.resolve(
          "src/styles/semantic-theme/theme.config",
        ),
      },
      extensions: [],
    },
  },

  {
    resolve: "gatsby-source-filesystem",

    options: {
      name: "images",

      path: path.join(__dirname, "src", "images"),
    },
  },

  "gatsby-plugin-sharp",

  "gatsby-transformer-sharp",

  {
    resolve: "gatsby-plugin-env-variables",

    options: {
      whitelist: ["API_URL", "NO_LOG"],
    },
  },

  {
    resolve: "gatsby-plugin-manifest",
    options: {
      name: "Ebnis",
      short_name: "Ebnis",
      start_url: "/",
      background_color: "#ffffff",
      theme_color: "#5faac7",
      // Enables "Add to Home screen" prompt and disables browser UI (including back button)
      // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
      display: "standalone",
      icon: "src/images/logo.png", // This path is relative to the root of the site.
    },
  },

  {
    resolve: `gatsby-plugin-create-client-paths`,
    options: { prefixes: [`/app/*`] },
  },

  "gatsby-plugin-sass",

  "gatsby-plugin-less",
];

if (!process.env.IS_E2E) {
  plugins = plugins.concat([
    {
      resolve: "offline-plugin",
      options: {
        workboxConfig: {
          cacheId: `ebnis-app`,
          // gatsby will make a request to all paths generated by Link
          // component, but paths such as /app/experience/experienceId/ are
          // client side only routes and the associated data is managed by
          // apollo graphql.
          ignoreURLParametersMatching: [
            /v/, //
            /app\/.+?\/page-data\.json/,
          ],
          cleanupOutdatedCaches: true,
          clientsClaim: false,
          skipWaiting: false,
        },

        otherOptions: {
          globPatternsFn,
          directoriesToCache: ["icons"],
        },

        precachePages: [
          "/login/", //
          "/app/",
          "/signup/",
        ],
      },
    },

    "gatsby-plugin-netlify",
  ]);
}

module.exports = {
  siteMetadata: {
    title: "Ebnis",
  },

  plugins,
};

function globPatternsFn() {
  const rootPath = path.resolve(".", "public");

  const chunks = [];

  fs.readdirSync(rootPath).forEach(filePath => {
    if (/^\d+-.+?\.js$/.test(filePath)) {
      chunks.push(filePath);
    }
  });

  return chunks;
}
