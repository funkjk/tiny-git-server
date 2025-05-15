/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  maxWorkers:1,
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "<rootDir>/__tests__"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "node_modules/@tiny-git-server/.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
  ],

    "moduleFileExtensions": [
      "ts",
      "cjs",
      "js"
    ]
};

module.exports = config;
