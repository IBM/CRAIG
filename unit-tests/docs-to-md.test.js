const { assert } = require("chai");
const fs = require("fs");
const { docsToMd, allDocs } = require("../client/src/lib/docs-to-md");
const docs = require("../client/src/lib/docs/docs.json");
const { eachKey, contains, distinct } = require("lazy-z");

describe("docs to markdown", () => {
  describe("doc tests", () => {
    it("should test docs to make sure that each table has an equal number of rows", () => {
      let pagesWithInvalidTables = [];
      eachKey({ ...docs }, (key) => {
        let content = docs[key].content;
        content.forEach((item) => {
          if (item.table) {
            let headerLength = item.table[0].length - 1;
            item.table.forEach((line) => {
              if (!contains(line, "_headers")) {
                if (line.length !== headerLength) {
                  pagesWithInvalidTables.push(key);
                }
              }
            });
          }
        });
      });

      assert.deepEqual(
        distinct(pagesWithInvalidTables),
        [],
        "no pages should have invalid tables"
      );
    });
  });

  describe("docsToMd", () => {
    it("should return correct markdown for component content", () => {
      let componentData = {
        content: [
          {
            text: "Identity and Access Management (IAM) settings can be configured account-wide. By default, users in your account verify themselves by logging in with a username and password. To require all users to use more secure authentication factors, enable the type of multifactor authentication (MFA) desired for the account.",
          },
          {
            text: "MFA types include:",
          },
          {
            table: [
              ["_headers", "NONE", "MFA Disabled"],
              [
                "TOTP",
                "all non-federated IBMid users are required to authenticate by using an IBMid, password, and time-based one-time passcode (TOTP)",
              ],
              [
                "TOTP4ALL",
                "all users are required to authenticate by using an IBMid, password, and time-based one-time passcode (TOTP)",
              ],
              [
                "Email-based MFA",
                "users authenticate by using a security password that's sent by email",
              ],
              [
                "TOTP MFA",
                "users authenticate by using a time-based one-time passcode (TOTP) with an authenticator app, such as IBM Security Verify or Google Authenticator",
              ],
              [
                "U2F MFA",
                "users authentication by using a hardware security key that generates a six-digit numerical code.",
              ],
            ],
          },
          {
            text: "If enabled, the multi-factor authentication should be set to the U2F MFA type for all users in your account. Based on the FIDO U2F standard, this method offers the highest level of security. This security is needed because the IBM Cloud Framework for Financial Services requires a smart card or hardware token that is designed and operated to FIPS 140-2 level 2 or higher or equivalent (for example, ANSI X9.24 or ISO 13491-1:2007).",
          },
        ],
        relatedLinks: [
          [
            "https://cloud.ibm.com/docs/account?topic=account-account-getting-started",
            "Setting up MFA Settings",
          ],
          [
            "https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-shared-account-setup",
            "IAM on IBM Cloud for Financial Services Setup",
          ],
        ],
      };
      let expectedData = fs.readFileSync(
        "./unit-tests/data-files/component-text.md",
        "utf8"
      );
      let actualData = docsToMd(componentData);
      assert.deepEqual(actualData, expectedData, "it should create markdown");
    });
  });
  describe("allDocs", () => {
    it("should return a markdown file for the whole slz docs json", () => {
      let actualData = allDocs();
      fs.writeFileSync("dev.md", actualData);
      let expectedData = fs.readFileSync(
        "./unit-tests/data-files/slz.md",
        "utf-8"
      );
      assert.deepEqual(actualData, expectedData, "it should return docs");
    });
  });
});
