/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/unit-tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/unit-tests/**",
    "!src/index.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      functions: 70,
      lines: 70,
      branches: 50,
    },
  },
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["node", "jest"],
          noUncheckedIndexedAccess: false,
        },
      },
    ],
  },
};
