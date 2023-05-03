const { assert } = require("chai");
const changelogToMarkdown = require("../client/src/lib/changelog-to-markdown");

describe("changelog-to-markdown", () => {
  it("should create a header", () => {
    let expectedData = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n`;
    let actualData = changelogToMarkdown([]);
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
  it("should create a version subheading from release notes array", () => {
    let expectedData = `# Changelog

All notable changes to this project will be documented in this file.

## 0.9.0

### Features

- Added development cheat code to allow developers to enter form debug mode easier
- Added a button to the f5 password input that generates a password for the user
- Added release notes page

### Fixes

- Fixed an issue that caused the home page to not load
`;
    let actualData = changelogToMarkdown([
      {
        version: "0.9.0",
        features: [
          "Added development cheat code to allow developers to enter form debug mode easier",
          "Added a button to the f5 password input that generates a password for the user",
          "Added release notes page",
        ],
        fixes: ["Fixed an issue that caused the home page to not load"],
      },
    ]);
    assert.deepEqual(actualData, expectedData, "it should create changelog");
  });
  it("should create a version subheading from release notes array when no fixes", () => {
    let expectedData = `# Changelog

All notable changes to this project will be documented in this file.

## 0.9.0

### Features

- Added development cheat code to allow developers to enter form debug mode easier
- Added a button to the f5 password input that generates a password for the user
- Added release notes page
`;
    let actualData = changelogToMarkdown([
      {
        version: "0.9.0",
        features: [
          "Added development cheat code to allow developers to enter form debug mode easier",
          "Added a button to the f5 password input that generates a password for the user",
          "Added release notes page",
        ],
      },
    ]);
    assert.deepEqual(actualData, expectedData, "it should create changelog");
  });
  it("should create a version subheading from release notes array with only fixes (bug-fix release)", () => {
    let expectedData = `# Changelog

All notable changes to this project will be documented in this file.

## 0.9.0

### Fixes

- Fixed an issue that caused the home page to not load
- Fixed an issue that caused the projects page to not load
`;
    let actualData = changelogToMarkdown([
      {
        version: "0.9.0",
        fixes: [
          "Fixed an issue that caused the home page to not load",
          "Fixed an issue that caused the projects page to not load",
        ],
      },
    ]);
    assert.deepEqual(actualData, expectedData, "it should create changelog");
  });
  it("should create a version subheading from release notes array when upgrade notes are provided", () => {
    let expectedData = `# Changelog

All notable changes to this project will be documented in this file.

## 0.9.0

### Upgrade Notes

- Removed Support for X, Y, Z

### Features

- Added development cheat code to allow developers to enter form debug mode easier
- Added a button to the f5 password input that generates a password for the user
- Added release notes page
`;
    let actualData = changelogToMarkdown([
      {
        version: "0.9.0",
        upgrade_notes: ["Removed Support for X, Y, Z"],
        features: [
          "Added development cheat code to allow developers to enter form debug mode easier",
          "Added a button to the f5 password input that generates a password for the user",
          "Added release notes page",
        ],
      },
    ]);
    assert.deepEqual(actualData, expectedData, "it should create changelog");
  });
});
