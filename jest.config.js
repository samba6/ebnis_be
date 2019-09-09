module.exports = {
  collectCoverageFrom: [
    "src/**/*.ts*",
    "!src/__tests__/**",
    "!src/logger.ts",
    "!src/state/**",
    "!src/pages/**",
    "!src/**/refresh-to-app.ts",
    "!src/graphql/**",
    "!src/components/AuthRequired**",
    "!src/components/**/*hoc.tsx",
    "!src/components/use-*",
    "!src/types.ts",
    "!src/components/RootHelmet/**",
    "!src/components/**/*-index.ts*",
    "!src/components/**/local*queries.ts",
    "!src/components/scroll-into-view.ts",
    "!src/**/*.d.ts",
    "!src/context.ts",
    "!src/socket.ts",
    "!src/components/NewEntry/update.ts",
    "!src/components/**/*gql.ts",
    "!src/test-utils/**",
    "!src/components/ExperienceNewEntryParent/loadables.ts",
    "!src/components/MyExperiences/preload-entries.ts",
    "!src/constants/apollo-schema.ts",
    "!src/components/ExperienceDefinition/resolvers.ts",
    "!src/components/Layout/pre-fetch-experiences.ts",
    "!src/components/Experience/loadables.ts",
    "!src/components/EditEntry/edit-entry.ts*",
    "!src/components/ExperienceDefinition/experience-definition.ts",
    "!src/components/ExperienceDefinition/experience-definition.update.ts",
    "!src/components/ExperienceNewEntryParent/experience-new-entry-parent-utils.ts",
    "!src/state/setup-observable.ts"
  ],
  setupFiles: [
    "<rootDir>/config/jest/loadershim.js",
    "react-app-polyfill/jsdom",
  ],
  setupFilesAfterEnv: ["<rootDir>/config/jest/setupTests.js"],
  testRegex: "src/__tests__/.+?\\.test\\.tsx?$",
  testEnvironment: "jest-environment-jsdom-fourteen",
  transform: {
    "^.+\\.tsx?$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.jsx?$": "<rootDir>/config/jest/gatsby-preprocess.js",
    "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)":
      "<rootDir>/config/jest/fileTransform.js",
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  modulePaths: [],
  moduleNameMapper: {
    "^react-native$": "react-native-web",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
  },
  moduleFileExtensions: ["js", "ts", "tsx", "json", "jsx", "node"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/cypress/",
    "<rootDir>/package.json",
    "<rootDir>/gatsby-*",
    "<rootDir>/src/pages/",
    "<rootDir>/\\.cache/",
    "<rootDir>/public/",
    "<rootDir>/src/graphql/.+?types",
    "<rootDir>/jest\\.config\\.js",
    "<rootDir>/coverage/",
  ],
  globals: {
    __PATH_PREFIX__: "",
  },
  testURL: "http://localhost",
  extraGlobals: ["Date"],
};
