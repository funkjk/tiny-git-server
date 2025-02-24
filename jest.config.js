const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  projects: ['<rootDir>/examples/*'],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
    "moduleFileExtensions": [
      "ts",
      "js"
    ],
    "globals": {
      "ts-jest": {
        "tsConfig": "tsconfig.json"
      }
    },
};

module.exports = config;
