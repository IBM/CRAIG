const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

let craig;

describe("cis global load balancer", () => {
  beforeEach(() => {
    craig = newState();
    craig.cis.create({
      name: "cis",
      resource_group: "slz-service-rg",
      plan: "trial",
      domains: [],
      dns_records: [],
    });
  });
  describe("cis_glbs.create", () => {
    it("should create a new cis glb", () => {
      craig.cis_glbs.create({
        cis: "cis",
        name: "pool",
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
      });
      assert.deepEqual(
        craig.store.json.cis_glbs,
        [
          {
            cis: "cis",
            name: "pool",
            origins: [],
            enabled: false,
            description: "example load balancer pool",
            minimum_origins: 1,
            check_regions: ["WEU"],
            notification_email: "someone@example.com",
            origins: [],
            glbs: [],
            health_checks: [],
          },
        ],
        "it should return data"
      );
    });
    it("should update cis glb cis after deletion", () => {
      craig.cis_glbs.create({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
        origins: [],
        glbs: [],
        health_checks: [],
      });
      craig.cis.delete(
        {
          name: "cis",
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
        craig.store.json.cis_glbs,
        [
          {
            cis: null,
            name: "pool",
            origins: [],
            enabled: false,
            description: "example load balancer pool",
            minimum_origins: 1,
            check_regions: ["WEU"],
            notification_email: "someone@example.com",
            origins: [],
            glbs: [],
            health_checks: [],
          },
        ],
        "it should return data"
      );
    });
  });
  describe("cis_glbs.save", () => {
    it("should save a cis glb", () => {
      craig.cis_glbs.create({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
        origins: [],
        glbs: [],
        health_checks: [],
      });
      craig.cis_glbs.save(
        {
          cis: "cis",
          name: "aaa",
          origins: [],
          enabled: false,
          description: "example load balancer pool",
          minimum_origins: 1,
          check_regions: ["WEU"],
          notification_email: "someone@example.com",
          origins: [],
          glbs: [],
          health_checks: [],
        },
        {
          data: {
            name: "pool",
          },
        }
      );
      assert.deepEqual(
        craig.store.json.cis_glbs,
        [
          {
            cis: "cis",
            name: "aaa",
            origins: [],
            enabled: false,
            description: "example load balancer pool",
            minimum_origins: 1,
            check_regions: ["WEU"],
            notification_email: "someone@example.com",
            origins: [],
            glbs: [],
            health_checks: [],
          },
        ],
        "it should return data"
      );
    });
  });
  describe("cis_glbs.delete", () => {
    it("should save a cis glb", () => {
      craig.cis_glbs.create({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
        origins: [],
        glbs: [],
        health_checks: [],
      });
      craig.cis_glbs.delete(
        {
          cis: "cis",
          name: "aaa",
          origins: [],
          enabled: false,
          description: "example load balancer pool",
          minimum_origins: 1,
          check_regions: ["WEU"],
          notification_email: "someone@example.com",
          origins: [],
          glbs: [],
          health_checks: [],
        },
        {
          data: {
            name: "pool",
          },
        }
      );
      assert.deepEqual(craig.store.json.cis_glbs, [], "it should return data");
    });
  });
  describe("cis_glbs schema", () => {
    beforeEach(() => {
      craig = newState();
      craig.cis.create({
        name: "cis",
        resource_group: "slz-service-rg",
        plan: "trial",
        domains: [],
        dns_records: [],
      });
      craig.cis_glbs.create({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
        origins: [],
        glbs: [],
        health_checks: [],
      });
    });
    it("should return correct cis groups", () => {
      assert.deepEqual(
        craig.cis_glbs.cis.groups({}, { craig: craig }),
        ["cis"],
        "it should return groups"
      );
    });
    it("should return invalid when description is invalid", () => {
      assert.isTrue(
        disableSave(
          "cis_glbs",
          { description: "@@@", name: "frog", cis: "toad" },
          {
            craig: craig,
          }
        ),
        "it should be disabled"
      );
    });
    it("should return false when notification_email is null", () => {
      assert.isFalse(
        craig.cis_glbs.notification_email.invalid({ notification_email: "" }),
        "it should be valid"
      );
    });
    it("should return false when notification_email is a valid email", () => {
      assert.isFalse(
        craig.cis_glbs.notification_email.invalid({
          notification_email: "frog.toad@frog.toad.com",
        }),
        "it should be valid"
      );
    });
    it("should return true when notification_email is a invalid email", () => {
      assert.isTrue(
        craig.cis_glbs.notification_email.invalid({
          notification_email: "frog.toad@frog.toad.",
        }),
        "it should be invalid"
      );
    });
  });
  describe("cis_glbs subComponents", () => {
    beforeEach(() => {
      craig = newState();
      craig.cis.create({
        name: "cis",
        resource_group: "slz-service-rg",
        plan: "trial",
        domains: [],
        dns_records: [],
      });
      craig.cis_glbs.create({
        cis: "cis",
        name: "pool",
        origins: [],
        enabled: false,
        description: "example load balancer pool",
        minimum_origins: 1,
        check_regions: ["WEU"],
        notification_email: "someone@example.com",
        origins: [],
        glbs: [],
        health_checks: [],
      });
    });
    describe("cis_glbs.origins", () => {
      it("should create an origin", () => {
        craig.cis_glbs.origins.create(
          {
            name: "example",
            enabled: false,
            address: "1.2.3.4",
            cis: "cis",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].origins,
          [
            {
              name: "example",
              enabled: false,
              address: "1.2.3.4",
              cis: "cis",
            },
          ],
          "it should create origin"
        );
      });
      it("should save an origin", () => {
        craig.cis_glbs.origins.create(
          {
            name: "example",
            enabled: false,
            address: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        craig.cis_glbs.origins.save(
          {
            name: "example2",
            enabled: false,
            address: "1.2.3.4",
          },
          {
            data: {
              name: "example",
            },
            arrayParentName: "pool",
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].origins,
          [
            {
              name: "example2",
              enabled: false,
              address: "1.2.3.4",
              cis: "cis",
            },
          ],
          "it should create origin"
        );
      });
      it("should delete an origin", () => {
        craig.cis_glbs.origins.create(
          {
            name: "example",
            enabled: false,
            address: "1.2.3.4",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        craig.cis_glbs.origins.delete(
          {
            name: "example2",
            enabled: false,
            address: "1.2.3.4",
          },
          {
            data: {
              name: "example",
            },
            arrayParentName: "pool",
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].origins,
          [],
          "it should create origin"
        );
      });
      describe("origin schema", () => {
        it("should return true when origin name is invalid", () => {
          assert.isTrue(
            disableSave(
              "origins",
              {
                name: "@@@",
              },
              {
                craig: craig,
              }
            ),
            "it should be invalid"
          );
        });
      });
    });
    describe("cis_glbs.glbs", () => {
      it("should create a glb", () => {
        craig.cis_glbs.glbs.create(
          {
            cis: "cis",
            domain: "example.com",
            fallback_pool: "pool",
            default_pools: ["pool"],
            enabled: false,
            proxied: false,
            ttl: 900,
            name: "www.example.com",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].glbs,
          [
            {
              cis: "cis",
              domain: "example.com",
              fallback_pool: "pool",
              default_pools: ["pool"],
              enabled: false,
              proxied: false,
              ttl: 900,
              name: "www.example.com",
            },
          ],
          "it should create origin"
        );
      });
      it("should save a glb", () => {
        craig.cis_glbs.glbs.create(
          {
            cis: "cis",
            domain: "example.com",
            fallback_pool: "pool",
            default_pools: ["pool"],
            enabled: false,
            proxied: false,
            ttl: 900,
            name: "www.example.com",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        craig.cis_glbs.glbs.save(
          {
            cis: "cis",
            domain: "example.com",
            fallback_pool: "pool",
            default_pools: ["pool"],
            enabled: false,
            proxied: false,
            ttl: 900,
            name: "www.example2.com",
          },
          {
            data: {
              name: "www.example.com",
            },
            arrayParentName: "pool",
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].glbs,
          [
            {
              cis: "cis",
              domain: "example.com",
              fallback_pool: "pool",
              default_pools: ["pool"],
              enabled: false,
              proxied: false,
              ttl: 900,
              name: "www.example2.com",
            },
          ],
          "it should create origin"
        );
      });
      it("should delete a glb", () => {
        craig.cis_glbs.glbs.create(
          {
            cis: "cis",
            domain: "example.com",
            fallback_pool: "pool",
            default_pools: ["pool"],
            enabled: false,
            proxied: false,
            ttl: 900,
            name: "www.example.com",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        craig.cis_glbs.glbs.delete(
          {
            cis: "cis",
            domain: "example.com",
            fallback_pool: "pool",
            default_pools: ["pool"],
            enabled: false,
            proxied: false,
            ttl: 900,
            name: "www.example.com",
          },
          {
            data: {
              name: "www.example.com",
            },
            arrayParentName: "pool",
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].glbs,
          [],
          "it should create origin"
        );
      });
      describe("schema", () => {
        it("should return list of domains from parent cis instance", () => {
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
            craig.cis_glbs.glbs.domain.groups(
              {},
              { craig: craig, arrayParentName: "pool" }
            ),
            ["example.com"],
            "it should return list of domains"
          );
        });
        it("should return a list of pools for fallback pool", () => {
          assert.deepEqual(
            craig.cis_glbs.glbs.fallback_pool.groups({}, { craig: craig }),
            ["pool"],
            "it should return list of pools"
          );
        });
        it("should be disabled when none default pools selected", () => {
          assert.isTrue(
            disableSave(
              "glbs",
              {
                domain: "hi",
                fallback_pool: "hi",
                default_pools: [],
              },
              {
                craig: craig,
                arrayParentName: "pool",
              }
            ),
            "it should be disabled"
          );
        });
        it("should be invalid if name is not a url", () => {
          assert.isTrue(
            craig.cis_glbs.glbs.name.invalid({ name: "frog" }),
            "it should be invalid"
          );
          assert.deepEqual(
            craig.cis_glbs.glbs.name.invalidText({ name: "frog" }),
            "Enter a valid domain name",
            "it should have correct invalid text"
          );
        });
        it("should be invalid if name is duplicate in modal", () => {
          craig.cis_glbs.glbs.create(
            {
              cis: "cis",
              domain: "example.com",
              fallback_pool: "pool",
              default_pools: ["pool"],
              enabled: false,
              proxied: false,
              ttl: 900,
              name: "www.example.com",
            },
            {
              innerFormProps: {
                arrayParentName: "pool",
              },
            }
          );
          assert.isTrue(
            craig.cis_glbs.glbs.name.invalid(
              { name: "www.example.com" },
              { craig: craig, arrayParentName: "pool" }
            ),
            "it should be invalid"
          );
          assert.deepEqual(
            craig.cis_glbs.glbs.name.invalidText(
              { name: "www.example.com" },
              { craig: craig, arrayParentName: "pool" }
            ),
            "Name www.example.com in use",
            "it should have correct invalid text"
          );
        });
        it("should be not invalid if name is not duplicate after save", () => {
          craig.cis_glbs.glbs.create(
            {
              cis: "cis",
              domain: "example.com",
              fallback_pool: "pool",
              default_pools: ["pool"],
              enabled: false,
              proxied: false,
              ttl: 900,
              name: "www.example.com",
            },
            {
              innerFormProps: {
                arrayParentName: "pool",
              },
            }
          );
          craig.cis_glbs.glbs.create(
            {
              cis: "cis",
              domain: "example2.com",
              fallback_pool: "pool",
              default_pools: ["pool"],
              enabled: false,
              proxied: false,
              ttl: 900,
              name: "www.example2.com",
            },
            {
              innerFormProps: {
                arrayParentName: "pool",
              },
            }
          );
          assert.isFalse(
            craig.cis_glbs.glbs.name.invalid(
              { name: "example3.com" },
              {
                craig: craig,
                arrayParentName: "pool",
                data: {
                  name: "www.example2.com",
                },
              }
            ),
            "it should be invalid"
          );
        });
      });
    });
    describe("cis_glbs.health_checks", () => {
      it("should create a health_check", () => {
        craig.cis_glbs.health_checks.create(
          {
            cis: "cis",
            name: "check",
            allow_insecure: true,
            expected_codes: 200,
            follow_redirects: true,
            interval: 60,
            method: "GET",
            timeout: 5,
            path: "/",
            port: 443,
            retries: 2,
            type: "https",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].health_checks,
          [
            {
              cis: "cis",
              name: "check",
              allow_insecure: true,
              expected_codes: 200,
              follow_redirects: true,
              interval: 60,
              method: "GET",
              timeout: 5,
              path: "/",
              port: 443,
              retries: 2,
              type: "https",
            },
          ],
          "it should create origin"
        );
      });
      it("should save a health_check", () => {
        craig.cis_glbs.health_checks.create(
          {
            cis: "cis",
            name: "check",
            allow_insecure: true,
            expected_codes: 200,
            follow_redirects: true,
            interval: 60,
            method: "GET",
            timeout: 5,
            path: "/",
            port: 443,
            retries: 2,
            type: "https",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        craig.cis_glbs.health_checks.save(
          {
            cis: "cis",
            name: "check2",
            allow_insecure: true,
            expected_codes: 200,
            follow_redirects: true,
            interval: 60,
            method: "GET",
            timeout: 5,
            path: "/",
            port: 443,
            retries: 2,
            type: "https",
          },
          {
            data: {
              name: "check",
            },
            arrayParentName: "pool",
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].health_checks,
          [
            {
              cis: "cis",
              name: "check2",
              allow_insecure: true,
              expected_codes: 200,
              follow_redirects: true,
              interval: 60,
              method: "GET",
              timeout: 5,
              path: "/",
              port: 443,
              retries: 2,
              type: "https",
            },
          ],
          "it should create origin"
        );
      });
      it("should delete a health_check", () => {
        craig.cis_glbs.health_checks.create(
          {
            cis: "cis",
            name: "check",
            allow_insecure: true,
            expected_codes: 200,
            follow_redirects: true,
            interval: 60,
            method: "GET",
            timeout: 5,
            path: "/",
            port: 443,
            retries: 2,
            type: "https",
          },
          {
            innerFormProps: {
              arrayParentName: "pool",
            },
          }
        );
        craig.cis_glbs.health_checks.delete(
          {
            cis: "cis",
            name: "check",
            allow_insecure: true,
            expected_codes: 200,
            follow_redirects: true,
            interval: 60,
            method: "GET",
            timeout: 5,
            path: "/",
            port: 443,
            retries: 2,
            type: "https",
          },
          {
            data: {
              name: "check",
            },
            arrayParentName: "pool",
          }
        );
        assert.deepEqual(
          craig.store.json.cis_glbs[0].health_checks,
          [],
          "it should create origin"
        );
      });
      describe("health checks schema", () => {
        it("should disable save when health check has duplicate name", () => {
          craig.cis_glbs.health_checks.create(
            {
              cis: "cis",
              name: "check",
              allow_insecure: true,
              follow_redirects: true,
              expected_codes: 200,
              interval: 60,
              method: "GET",
              timeout: 5,
              path: "/",
              port: 443,
              retries: 2,
              type: "https",
            },
            {
              innerFormProps: {
                arrayParentName: "pool",
              },
            }
          );
          assert.isTrue(
            disableSave(
              "health_checks",
              { name: "check" },
              { craig: craig, isModal: true, data: { name: "" } }
            ),
            "it should be disabled"
          );
        });
      });
    });
  });
});
