const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

let craig;

describe("cis", () => {
  beforeEach(() => {
    craig = newState();
  });
  describe("cis.init", () => {
    it("should initialize cis store", () => {
      assert.deepEqual(craig.store.json.cis, [], "it should set cis");
    });
  });
  describe("cis.create", () => {
    it("should create a new cis instance", () => {
      craig.cis.create({
        name: "cis",
        resource_group: "slz-service-rg",
        plan: "trial",
        domains: [],
        dns_records: [],
      });
      assert.deepEqual(
        craig.store.json.cis,
        [
          {
            name: "cis",
            resource_group: "slz-service-rg",
            plan: "trial",
            domains: [],
            dns_records: [],
          },
        ],
        "it should create a new cis instance"
      );
    });
  });
  describe("cis.save", () => {
    it("should update a cis instance", () => {
      craig.cis.create({
        name: "cis",
        resource_group: "slz-service-rg",
        plan: "trial",
        domains: [],
        dns_records: [],
      });
      craig.cis.save(
        {
          name: "aaaa",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        },
        {
          data: {
            name: "cis",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.cis[0].name,
        "aaaa",
        "it should update the instance"
      );
    });
  });
  describe("cis.delete", () => {
    it("should delete cis instance", () => {
      craig.cis.create({
        name: "cis",
        resource_group: "slz-service-rg",
        plan: "trial",
        domains: [],
        dns_records: [],
      });
      craig.cis.delete(
        {},
        {
          data: {
            name: "cis",
            resource_group: "slz-service-rg",
            plan: "trial",
            domains: [],
            dns_records: [],
          },
        }
      );
      assert.deepEqual(
        craig.store.json.cis,
        [],
        "it should create a new cis instance"
      );
    });
  });
  describe("cis.domains", () => {
    beforeEach(() => {
      craig = newState();
    });
    describe("cis.domains.create", () => {
      it("should create a cis domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.domains.create(
          {
            domain: "example.com",
            type: "full",
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis,
          [
            {
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              domains: [
                {
                  cis: "cis",
                  domain: "example.com",
                  type: "full",
                },
              ],
              dns_records: [],
            },
          ],
          "it should add domain"
        );
      });
    });
    describe("cis.domains.save", () => {
      it("should update a cis domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.domains.create(
          {
            cis: "cis",
            domain: "example.com",
            type: "full",
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        craig.cis.domains.save(
          {
            cis: "cis",
            domain: "example2.com",
            type: "full",
          },
          {
            arrayParentName: "cis",
            data: {
              domain: "example.com",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis,
          [
            {
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              domains: [
                {
                  cis: "cis",
                  domain: "example2.com",
                  type: "full",
                },
              ],
              dns_records: [],
            },
          ],
          "it should add domain"
        );
      });
    });
    describe("cis.domains.delete", () => {
      it("should delete a cis domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.domains.create(
          {
            domain: "example.com",
            type: "full",
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        craig.cis.domains.delete(
          {
            domain: "example.com",
            type: "full",
          },
          {
            arrayParentName: "cis",
            data: {
              domain: "example.com",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis,
          [
            {
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              domains: [],
              dns_records: [],
            },
          ],
          "it should add domain"
        );
      });
    });
    describe("cis.domains.shouldDsiableSave", () => {
      it("should be disabled when a domain has an invalid domain", () => {
        assert.isTrue(
          disableSave(
            "domains",
            {
              domain: "@@@",
            },
            {
              craig: craig,
            }
          ),
          "it should be disabled"
        );
      });
      it("should be disabled when a domain has an invalid duplicate domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.domains.create(
          {
            domain: "example.com",
            type: "full",
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        craig.cis.domains.create(
          {
            domain: "egg.com",
            type: "full",
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        assert.isTrue(
          disableSave(
            "domains",
            {
              domain: "example.com",
            },
            {
              craig: craig,
              data: {
                domain: "egg.com",
              },
            }
          ),
          "it should be disabled"
        );
      });
    });
  });
  describe("cis.dns_records", () => {
    beforeEach(() => {
      craig = newState();
    });
    describe("cis.dns_records.create", () => {
      it("should create a cis domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.dns_records.create(
          {
            domain: "example.com",
            type: "A",
            name: "test-example",
            content: "1.2.3.4",
            ttl: 900,
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis,
          [
            {
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              dns_records: [
                {
                  cis: "cis",
                  domain: "example.com",
                  type: "A",
                  name: "test-example",
                  content: "1.2.3.4",
                  ttl: 900,
                },
              ],
              domains: [],
            },
          ],
          "it should add domain"
        );
      });
    });
    describe("cis.dns_records.save", () => {
      it("should create a cis domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.dns_records.create(
          {
            domain: "example.com",
            type: "A",
            name: "test-example",
            content: "1.2.3.4",
            ttl: 900,
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        craig.cis.dns_records.save(
          {
            domain: "example.com",
            type: "A",
            name: "aaaaa",
            content: "1.2.3.4",
            ttl: 900,
          },
          {
            arrayParentName: "cis",
            data: { name: "test-example" },
          }
        );
        assert.deepEqual(
          craig.store.json.cis,
          [
            {
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              dns_records: [
                {
                  cis: "cis",
                  domain: "example.com",
                  type: "A",
                  name: "aaaaa",
                  content: "1.2.3.4",
                  ttl: 900,
                },
              ],
              domains: [],
            },
          ],
          "it should add domain"
        );
      });
    });
    describe("cis.dns_records.delete", () => {
      it("should delete a cis domain", () => {
        craig.cis.create({
          name: "cis",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.dns_records.create(
          {
            domain: "example.com",
            type: "A",
            name: "test-example",
            content: "1.2.3.4",
            ttl: 900,
          },
          {
            innerFormProps: {
              arrayParentName: "cis",
            },
          }
        );
        craig.cis.dns_records.delete(
          {
            domain: "example.com",
            type: "A",
            name: "test-example",
            content: "1.2.3.4",
            ttl: 900,
          },
          {
            arrayParentName: "cis",
            data: {
              name: "test-example",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis,
          [
            {
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              dns_records: [],
              domains: [],
            },
          ],
          "it should add domain"
        );
      });
    });
    describe("cis.dns_records.shouldDisableSave", () => {
      it("should disable save when cis dns record has a duplicate name", () => {
        let craig = newState();
        craig.cis.create({
          name: "frog",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        craig.cis.dns_records.create(
          {
            domain: "example.com",
            type: "A",
            name: "test-example",
            content: "1.2.3.4",
            ttl: 900,
          },
          {
            innerFormProps: {
              arrayParentName: "frog",
            },
          }
        );
        assert.isTrue(
          disableSave(
            "dns_records",
            {
              name: "test-example",
            },
            {
              data: {
                name: "",
              },
              craig: craig,
              innerFormProps: {
                arrayParentName: "cis",
              },
            }
          ),
          "it should be disabled"
        );
      });
      it("should not be disabled when ttl is empty string", () => {
        let craig = newState();
        craig.cis.create({
          name: "frog",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        assert.isFalse(
          disableSave(
            "dns_records",
            {
              domain: "example.com",
              type: "A",
              name: "frog-example",
              content: "1.2.3.4",
              ttl: "",
            },
            {
              data: {
                name: "",
              },
              craig: craig,
              innerFormProps: {
                arrayParentName: "cis",
              },
            }
          ),
          "it should be disabled"
        );
      });
      it("should be disabled when ttl is not a whole number", () => {
        let craig = newState();
        craig.cis.create({
          name: "frog",
          resource_group: "slz-service-rg",
          plan: "trial",
          domains: [],
          dns_records: [],
        });
        assert.isTrue(
          disableSave(
            "dns_records",
            {
              domain: "example.com",
              type: "A",
              name: "aaaa",
              content: "1.2.3.4",
              ttl: "@@",
            },
            {
              craig: craig,
              innerFormProps: {
                arrayParentName: "cis",
              },
            }
          ),
          "it should be disabled"
        );
      });
    });
  });
  describe("cis.shouldDisableSave", () => {
    it("should disable save when cis has a duplicate name", () => {
      let craig = newState();
      craig.cis.create({
        name: "frog",
        resource_group: "slz-service-rg",
        plan: "trial",
        domains: [],
        dns_records: [],
      });
      assert.isTrue(
        disableSave(
          "cis",
          {
            name: "frog",
          },
          {
            data: {
              name: "",
            },
            craig: craig,
          }
        ),
        "it should be disabled"
      );
    });
  });
  describe("cis.schema", () => {
    describe("cis.domains.invalid", () => {
      it("should be valid with multiple subdomains", () => {
        assert.isFalse(
          craig.cis.domains.domain.invalid(
            { domain: "sub.cis-terraform.com" },
            {
              craig: state(),
            }
          ),
          "it should be false"
        );
      });
      it("should be invalid with spaces subdomains", () => {
        assert.isTrue(
          craig.cis.domains.domain.invalid(
            { domain: "sub.cis-  terraform.com" },
            {
              craig: state(),
            }
          ),
          "it should be false"
        );
      });
    });
    describe("cis.dns_records.schema", () => {
      describe("cis.dns_records.domains", () => {
        describe("cis.dns_records.domains.groups", () => {
          it("should return a list of domains", () => {
            craig.cis.create({
              name: "cis",
              resource_group: "slz-service-rg",
              plan: "trial",
              domains: [],
              dns_records: [],
            });
            craig.cis.domains.create(
              {
                domain: "example.com",
                type: "full",
              },
              {
                innerFormProps: {
                  arrayParentName: "cis",
                },
              }
            );
            assert.deepEqual(
              craig.cis.dns_records.domain.groups(
                {},
                { craig: craig, arrayParentName: "cis" }
              ),
              ["example.com"],
              "it should return domains"
            );
          });
        });
      });
    });
  });
});
