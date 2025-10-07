const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { disableSave } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("secrets_manager", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("secrets_manager.init", () => {
    it("should initialize secrets_manager", () => {
      assert.deepEqual(
        craig.store.json.secrets_manager,
        [],
        "it should have secrets_manager initialized"
      );
    });
  });
  describe("secrets_manager crud functions", () => {
    it("should add an secrets_manager instance", () => {
      craig.secrets_manager.create({ name: "default" });
      assert.deepEqual(
        craig.store.json.secrets_manager,
        [
          {
            name: "default",
            resource_group: null,
            encryption_key: null,
            kms: null,
            secrets: [],
            secrets_groups: [],
            certificates: [],
          },
        ],
        "it should create secrets_manager"
      );
    });
    it("should save an secrets_manager instance", () => {
      craig.secrets_manager.create({
        name: "default",
        encryption_key: "key",
      });
      craig.secrets_manager.save(
        { resource_group: "service-rg" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        craig.store.json.secrets_manager[0].resource_group,
        "service-rg",
        "it should create secrets_manager"
      );
    });
    it("should update cluster.opaque_secrets.secret_manager name when secrets manager is renamed", () => {
      craig.store.json.clusters[0].opaque_secrets[0] = {
        name: "test",
        secrets_manager: "default",
      };
      craig.secrets_manager.create({
        name: "default",
        encryption_key: "key",
      });
      craig.secrets_manager.save(
        { name: "new-name" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].opaque_secrets[0].secrets_manager,
        "new-name",
        "it should update cluster.opaque_secrets"
      );
    });
    it("should not update cluster.opaque_secrets.secret_manager name when unrelated secrets manager is renamed", () => {
      craig.store.json.clusters[0].opaque_secrets[0] = {
        name: "test",
        secrets_manager: "frog",
      };
      craig.secrets_manager.create({
        name: "default",
        encryption_key: "key",
      });
      craig.secrets_manager.save(
        { name: "new-name" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].opaque_secrets[0].secrets_manager,
        "frog",
        "it should not update cluster.opaque_secrets"
      );
    });
    it("should not update cluster.opaque_secrets.secret_manager when no opaque secrets", () => {
      delete craig.store.json.clusters[0].opaque_secrets;
      craig.secrets_manager.create({
        name: "default",
        encryption_key: "key",
      });
      craig.secrets_manager.save(
        { name: "new-name" },
        { data: { name: "default" } }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].opaque_secrets,
        [],
        "it should update cluster.opaque_secrets"
      );
    });
    it("should not update empty cluster secrets when secrets manager updates", () => {
      craig.store.json.clusters[0].opaque_secrets = [];
      craig.secrets_manager.create({
        name: "new-secret-manager",
        encryption_key: "key",
      });
      craig.secrets_manager.save(
        { name: "updated-name" },
        { data: { name: "new-secret-manager" } }
      );
      assert.deepEqual(
        craig.store.json.clusters[0].opaque_secrets,
        [],
        "it should not update cluster.opaque_secrets"
      );
    });
    it("should delete an secrets_manager instance", () => {
      craig.secrets_manager.create({ name: "default" });
      craig.secrets_manager.delete({}, { data: { name: "default" } });
      assert.deepEqual(
        craig.store.json.secrets_manager,
        [],
        "it should create secrets_manager"
      );
    });
  });
  describe("schema", () => {
    describe("name", () => {
      it("should return true if a secrets manager instance has an invalid name", () => {
        assert.isTrue(
          craig.secrets_manager.name.invalid(
            {
              name: "@@@",
              resource_group: "managment-rg",
              encryption_key: "key",
            },
            {
              craig: craig,
              data: {
                name: "frog",
              },
            }
          ),
          "it should be true"
        );
      });
    });
    describe("resource_group", () => {
      it("should return true if a secrets manager instance has an invalid resource group", () => {
        assert.isTrue(
          craig.secrets_manager.resource_group.invalid(
            { name: "frog", resource_group: null, use_data: false },
            {
              craig: state(),
              data: {
                name: "test",
              },
            }
          ),
          "it should be false"
        );
      });
    });
    describe("encryption_key", () => {
      it("should return true if a secrets manager instance has an invalid encryption key", () => {
        assert.isTrue(
          craig.secrets_manager.encryption_key.invalid(
            {
              name: "frog2",
              resource_group: "management-rg",
              encryption_key: null,
              use_data: false,
            },
            {
              craig: state(),
              data: {
                name: "test",
              },
            }
          ),
          "it should be false"
        );
      });
    });
    describe("plan", () => {
      it("should return correct data on render when no plan in data", () => {
        assert.deepEqual(
          craig.secrets_manager.plan.onRender({ plan: "standard" }, {}),
          "Standard",
          "it should return correct plan"
        );
      });
      it("should return correct data on render when no plan in data", () => {
        assert.deepEqual(
          craig.secrets_manager.plan.onRender(
            { plan: "standard" },
            { data: {} }
          ),
          "Standard",
          "it should return correct plan"
        );
      });
      it("should return correct data on render when no plan in data", () => {
        assert.deepEqual(
          craig.secrets_manager.plan.onRender(
            { plan: "standard" },
            { data: { plan: "standard" } }
          ),
          "Standard",
          "it should return correct plan"
        );
      });
    });
  });
  describe("secrets groups", () => {
    describe("secrets groups crud functions", () => {
      it("should add a secrets group to a secrets_manager instance", () => {
        craig.secrets_manager.create({ name: "default" });
        craig.secrets_manager.secrets_groups.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.secrets_manager,
          [
            {
              name: "default",
              resource_group: null,
              encryption_key: null,
              kms: null,
              secrets: [],
              certificates: [],
              secrets_groups: [
                {
                  name: "group",
                  secrets_manager: "default",
                },
              ],
            },
          ],
          "it should create secrets_manager"
        );
      });
      it("should save an secrets_manager instance", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.secrets_manager.secrets_groups.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        craig.secrets_manager.secrets_groups.save(
          { name: "frog" },
          { data: { name: "group" }, arrayParentName: "default" }
        );
        assert.deepEqual(
          craig.store.json.secrets_manager[0].secrets_groups[0].name,
          "frog",
          "it should create secrets_manager"
        );
      });
      it("should delete an secrets_manager instance", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.secrets_manager.secrets_groups.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        craig.secrets_manager.secrets_groups.delete(
          {},
          { data: { name: "group" }, arrayParentName: "default" }
        );
        assert.deepEqual(
          craig.store.json.secrets_manager[0].secrets_groups,
          [],
          "it should create secrets_manager"
        );
      });
    });
    describe("disable save", () => {
      it("should disable save when a secrets group has an invalid duplicate name", () => {
        craig.secrets_manager.create({ name: "default" });
        craig.secrets_manager.secrets_groups.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        assert.isTrue(
          craig.secrets_manager.secrets_groups.name.invalid(
            { name: "group" },
            {
              craig: craig,
              data: {
                name: "",
              },
            }
          ) &&
            disableSave(
              "secrets_groups",
              { name: "group" },
              {
                craig: craig,
                data: {
                  name: "",
                },
              }
            ),
          "it should not be valid"
        );
      });
    });
  });
  describe("certificates", () => {
    describe("certificates crud functions", () => {
      it("should add a certificate to a secrets_manager instance", () => {
        craig.secrets_manager.create({ name: "default" });
        craig.secrets_manager.certificates.create(
          {
            type: "private",
            name: "private-cert",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            description: "cert",
            certificate_template: "cert-sign-template",
            ttl: "364d",
            common_name: "private.cert.com",
            auto_rotate: true,
            interval: "180",
            unit: "day",
            max_ttl: "a million",
          },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        craig.secrets_manager.certificates.create(
          {
            type: "template",
            name: "cert-sign-template",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            max_ttl: "8760h",
            server_flag: true,
            client_flag: false,
            allow_subdomains: true,
            allowed_domains: ["frog.test.com"],
            ext_key_usage: ["ServerAuth"],
            key_usage: ["CertSign"],
            certificate_authority: "inter-ca",
            description: "cert",
          },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        craig.secrets_manager.certificates.create(
          {
            type: "intermediate_ca",
            name: "inter-ca",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            common_name: "inter.ca.com",
            issuer: "root-ca",
            country: "US",
            organization: "IBM",
            signing_method: "internal",
            key_bits: "4096",
            max_ttl: "365d",
            description: "cert",
            signing_method: null,
          },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        assert.deepEqual(
          craig.store.json.secrets_manager,
          [
            {
              name: "default",
              resource_group: null,
              kms: null,
              encryption_key: null,
              secrets: [],
              secrets_groups: [],
              certificates: [
                {
                  type: "private",
                  name: "private-cert",
                  secrets_manager: "default",
                  secrets_group: null,
                  description: "cert",
                  certificate_template: null,
                  ttl: "364d",
                  common_name: "private.cert.com",
                  auto_rotate: true,
                  interval: "180",
                  unit: "day",
                  max_ttl: null,
                  country: null,
                  organization: null,
                  issuer: null,
                  certificate_authority: null,
                  key_usage: [],
                  ext_key_usage: [],
                  allowed_domains: [],
                  server_flag: false,
                  client_flag: false,
                  allow_subdomains: false,
                  signing_method: null,
                  key_bits: null,
                },
                {
                  type: "template",
                  name: "cert-sign-template",
                  secrets_manager: "default",
                  secrets_group: null,
                  country: "US",
                  organization: "IBM",
                  key_bits: "4096",
                  max_ttl: "8760h",
                  server_flag: true,
                  client_flag: false,
                  allow_subdomains: true,
                  signing_method: null,
                  allowed_domains: ["frog.test.com"],
                  ext_key_usage: ["ServerAuth"],
                  key_usage: ["CertSign"],
                  certificate_authority: null,
                  description: "cert",
                  ttl: null,
                  issuer: null,
                  certificate_template: null,
                  unit: null,
                  interval: null,
                },
                {
                  type: "intermediate_ca",
                  name: "inter-ca",
                  secrets_manager: "default",
                  secrets_group: null,
                  common_name: "inter.ca.com",
                  issuer: null,
                  country: "US",
                  organization: "IBM",
                  signing_method: null,
                  key_bits: "4096",
                  max_ttl: "365d",
                  description: "cert",
                  ttl: null,
                  certificate_authority: null,
                  certificate_template: null,
                  key_usage: [],
                  ext_key_usage: [],
                  allowed_domains: [],
                  unit: null,
                  interval: null,
                  server_flag: false,
                  client_flag: false,
                  allow_subdomains: false,
                },
              ],
            },
          ],
          "it should create secrets_manager"
        );
      });
      it("should save an secrets_manager instance", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.secrets_manager.certificates.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        craig.secrets_manager.certificates.save(
          { name: "frog" },
          { data: { name: "group" }, arrayParentName: "default" }
        );
        assert.deepEqual(
          craig.store.json.secrets_manager[0].certificates[0].name,
          "frog",
          "it should create secrets_manager"
        );
      });
      it("should delete an secrets_manager instance", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.secrets_manager.certificates.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        craig.secrets_manager.certificates.delete(
          {},
          { data: { name: "group" }, arrayParentName: "default" }
        );
        assert.deepEqual(
          craig.store.json.secrets_manager[0].certificates,
          [],
          "it should create secrets_manager"
        );
      });
    });
    describe("schema", () => {
      it("should return the correct type text on render", () => {
        assert.deepEqual(
          craig.secrets_manager.certificates.type.onRender({ type: "root_ca" }),
          "Root CA",
          "it should return correct text"
        );
        assert.deepEqual(
          craig.secrets_manager.certificates.type.onInputChange({
            type: "Root CA",
          }),
          "root_ca",
          "it should return correct text"
        );
      });
      it("should correctly show invalid common name", () => {
        assert.isTrue(
          craig.secrets_manager.certificates.common_name.hideWhen({}),
          "it should be hidden when no type and no common name"
        );
        assert.isTrue(
          craig.secrets_manager.certificates.common_name.hideWhen({
            type: "template",
          }),
          "it should be hidden when template"
        );
        assert.isFalse(
          craig.secrets_manager.certificates.common_name.invalid({}),
          "it should not be invalid when no type"
        );
        assert.isTrue(
          craig.secrets_manager.certificates.common_name.invalid({
            type: "root_ca",
          }),
          "it should be invalid when type and no common name"
        );
        assert.isFalse(
          craig.secrets_manager.certificates.common_name.invalid({
            type: "root_ca",
            common_name: "example.com",
          }),
          "it should be invalid when type and common name"
        );
      });
      it("should return correct list of secrets groups", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.secrets_manager.secrets_groups.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        assert.deepEqual(
          craig.secrets_manager.certificates.secrets_group.groups(
            {},
            { arrayParentName: "default", craig: craig }
          ),
          ["group"],
          "it should return list of groups"
        );
      });
      it("should handle country validity", () => {
        assert.isTrue(
          craig.secrets_manager.certificates.country.invalid({ country: "" }),
          "it should not be valid"
        );
        assert.isTrue(
          craig.secrets_manager.certificates.country.invalid({
            country: "aaaa",
          }),
          "it should not be valid"
        );
        assert.isTrue(
          craig.secrets_manager.certificates.country.invalid({
            country: "AAAAAA",
          }),
          "it should not be valid"
        );
        assert.isFalse(
          craig.secrets_manager.certificates.country.invalid({ country: "US" }),
          "it should be valid"
        );
      });
      it("should return true if a description is not valid", () => {
        assert.isTrue(
          craig.secrets_manager.certificates.description.invalid({
            description: "@@@",
          }),
          "it should not be valid"
        );
        assert.isFalse(
          craig.secrets_manager.certificates.description.invalid({}),
          "it should not be valid"
        );
      });
      it("should return a list of groups for certificates", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.store.json.secrets_manager[0].certificates = [
          {
            type: "root_ca",
            name: "root-ca",
            common_name: "root.ca.com",
            max_ttl: "365d",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            description: "cert",
          },
          {
            type: "root_ca",
            name: "no-group",
            common_name: "root.ca.com",
            max_ttl: "365d",
            secrets_manager: "secrets-manager",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            description: "cert",
          },
          {
            type: "intermediate_ca",
            name: "inter-ca",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            common_name: "inter.ca.com",
            issuer: "root-ca",
            country: "US",
            organization: "IBM",
            signing_method: "internal",
            key_bits: "4096",
            max_ttl: "365d",
            description: "cert",
          },
          {
            type: "template",
            name: "cert-sign-template",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            max_ttl: "8760h",
            server_flag: true,
            client_flag: false,
            allow_subdomains: true,
            allowed_domains: ["frog.test.com"],
            ext_key_usage: ["ServerAuth"],
            key_usage: ["CertSign"],
            certificate_authority: "inter-ca",
            description: "cert",
          },
          {
            type: "private",
            name: "private-cert",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            description: "cert",
            certificate_template: "cert-sign-template",
            ttl: "364d",
            common_name: "private.cert.com",
            auto_rotate: true,
            interval: "180",
            unit: "day",
          },
        ];
        assert.deepEqual(
          craig.secrets_manager.certificates.issuer.groups(
            {},
            {
              arrayParentName: "default",
              craig: craig,
              data: {
                name: "frog",
              },
            }
          ),
          ["root-ca", "no-group"],
          "it should return correct data"
        );

        assert.isTrue(
          craig.secrets_manager.certificates.issuer.invalid(
            { type: "intermediate_ca" },
            {}
          ),
          "it should not be valid"
        );
      });
      it("should not hide server flag when type is template", () => {
        assert.isFalse(
          craig.secrets_manager.certificates.server_flag.hideWhen({
            type: "template",
          }),
          "it should not be hidden"
        );
      });
      it("should return true when allowed domains is not a valid list", () => {
        assert.isTrue(
          craig.secrets_manager.certificates.allowed_domains.invalid({
            allowed_domains: [],
            type: "template",
          }),
          "it should not be valid when empty"
        );
        assert.isTrue(
          craig.secrets_manager.certificates.allowed_domains.invalid({
            allowed_domains: ["good-url.com", "b@durl"],
            type: "template",
          }),
          "it should not be valid when list contains a bad url"
        );
        assert.isFalse(
          craig.secrets_manager.certificates.allowed_domains.invalid({
            allowed_domains: ["good-url.com"],
            type: "template",
          }),
          "it should be valid when list does not contain a bad url"
        );
        assert.isFalse(
          craig.secrets_manager.certificates.allowed_domains.invalid({}),
          "it should be valid when not template"
        );
      });
      it("should return a list of groups for certificate authority", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.store.json.secrets_manager[0].certificates = [
          {
            type: "root_ca",
            name: "root-ca",
            common_name: "root.ca.com",
            max_ttl: "365d",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            description: "cert",
          },
          {
            type: "root_ca",
            name: "no-group",
            common_name: "root.ca.com",
            max_ttl: "365d",
            secrets_manager: "secrets-manager",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            description: "cert",
          },
          {
            type: "intermediate_ca",
            name: "inter-ca",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            common_name: "inter.ca.com",
            issuer: "root-ca",
            country: "US",
            organization: "IBM",
            signing_method: "internal",
            key_bits: "4096",
            max_ttl: "365d",
            description: "cert",
          },
          {
            type: "template",
            name: "cert-sign-template",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            max_ttl: "8760h",
            server_flag: true,
            client_flag: false,
            allow_subdomains: true,
            allowed_domains: ["frog.test.com"],
            ext_key_usage: ["ServerAuth"],
            key_usage: ["CertSign"],
            certificate_authority: "inter-ca",
            description: "cert",
          },
          {
            type: "private",
            name: "private-cert",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            description: "cert",
            certificate_template: "cert-sign-template",
            ttl: "364d",
            common_name: "private.cert.com",
            auto_rotate: true,
            interval: "180",
            unit: "day",
          },
        ];
        assert.deepEqual(
          craig.secrets_manager.certificates.certificate_authority.groups(
            {},
            {
              arrayParentName: "default",
              craig: craig,
              data: {
                name: "frog",
              },
            }
          ),
          ["inter-ca"],
          "it should return correct data"
        );

        assert.isTrue(
          craig.secrets_manager.certificates.certificate_authority.invalid(
            { type: "template" },
            {}
          ),
          "it should not be valid"
        );
      });
      it("should return a list of groups for certificate template", () => {
        craig.secrets_manager.create({
          name: "default",
          encryption_key: "key",
        });
        craig.store.json.secrets_manager[0].certificates = [
          {
            type: "root_ca",
            name: "root-ca",
            common_name: "root.ca.com",
            max_ttl: "365d",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            description: "cert",
          },
          {
            type: "root_ca",
            name: "no-group",
            common_name: "root.ca.com",
            max_ttl: "365d",
            secrets_manager: "secrets-manager",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            description: "cert",
          },
          {
            type: "intermediate_ca",
            name: "inter-ca",
            secrets_manager: "secrets-manager",
            secrets_group: "bad-group",
            common_name: "inter.ca.com",
            issuer: "root-ca",
            country: "US",
            organization: "IBM",
            signing_method: "internal",
            key_bits: "4096",
            max_ttl: "365d",
            description: "cert",
          },
          {
            type: "template",
            name: "cert-sign-template",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            country: "US",
            organization: "IBM",
            key_bits: "4096",
            max_ttl: "8760h",
            server_flag: true,
            client_flag: false,
            allow_subdomains: true,
            allowed_domains: ["frog.test.com"],
            ext_key_usage: ["ServerAuth"],
            key_usage: ["CertSign"],
            certificate_authority: "inter-ca",
            description: "cert",
          },
          {
            type: "private",
            name: "private-cert",
            secrets_manager: "secrets-manager",
            secrets_group: "group",
            description: "cert",
            certificate_template: "cert-sign-template",
            ttl: "364d",
            common_name: "private.cert.com",
            auto_rotate: true,
            interval: "180",
            unit: "day",
          },
        ];
        craig.update();
        assert.isNull(
          craig.store.json.secrets_manager[0].certificates[0].description,
          "it should be null"
        );
        assert.deepEqual(
          craig.secrets_manager.certificates.certificate_template.groups(
            {
              type: "template",
            },
            {
              arrayParentName: "default",
              craig: craig,
              data: {
                name: "frog",
              },
            }
          ),
          ["inter-ca"],
          "it should return correct data"
        );
        assert.deepEqual(
          craig.secrets_manager.certificates.certificate_template.groups(
            { type: "private" },
            {
              arrayParentName: "default",
              craig: craig,
              data: {
                name: "frog",
              },
            }
          ),
          ["cert-sign-template"],
          "it should return correct data"
        );
        assert.isTrue(
          craig.secrets_manager.certificates.certificate_template.invalid(
            { type: "private" },
            {}
          ),
          "it should not be valid"
        );
      });
      it("should hide template when not private cert", () => {
        assert.isTrue(
          craig.secrets_manager.certificates.certificate_template.hideWhen({
            type: "intermediate_ca",
          }),
          "it should be hidden"
        );
      });
      describe("validation", () => {
        it("should test valid interval", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.interval.invalid({}),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.interval.invalid({
              type: "private",
            }),
            "it should not be valid"
          );
        });
        it("should test valid unit", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.unit.invalid({}),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.unit.invalid({
              type: "private",
            }),
            "it should not be valid"
          );
        });
        it("should test valid ttl", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.ttl.invalid({}),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.ttl.invalid({ type: "private" }),
            "it should not be valid"
          );
        });
        it("should test valid ext_key_usage", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.ext_key_usage.invalid({}),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.ext_key_usage.invalid({
              type: "template",
              ext_key_usage: [],
            }),
            "it should not be valid"
          );
        });
        it("should test valid key_usage", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.key_usage.invalid({}),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.key_usage.invalid({
              type: "template",
              key_usage: [],
            }),
            "it should not be valid"
          );
        });
        it("should hide certificate issuer when not an intermediate ca certificate", () => {
          assert.isTrue(
            craig.secrets_manager.certificates.issuer.hideWhen({
              type: "root_ca",
            }),
            "it should be hidden"
          );
        });
        it("should have correct validation for organization", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.organization.invalid({
              type: "private",
            }),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.organization.invalid({
              type: "root_ca",
            }),
            "it should not be valid"
          );
        });
        it("should have correct validation for country", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.country.invalid({
              type: "private",
            }),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.country.hideWhen({
              type: "private",
            }),
            "it should not be hidden"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.country.invalid({
              type: "root_ca",
            }),
            "it should not be valid"
          );
        });
        it("should have correct validation for max_ttl", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.max_ttl.invalid({
              type: "private",
            }),
            "it should be valid"
          );
          assert.isFalse(
            craig.secrets_manager.certificates.max_ttl.hideWhen({
              type: "template",
            }),
            "it should be hidden"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.max_ttl.invalid({
              type: "root_ca",
            }),
            "it should not be valid"
          );
        });
        it("should hide description", () => {
          assert.isTrue(
            craig.secrets_manager.certificates.description.hideWhen({}),
            "it should be hidden"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.description.hideWhen({
              type: "root_ca",
            }),
            "it should be hidden"
          );
        });
        it("should handle secrets group validation", () => {
          assert.isTrue(
            craig.secrets_manager.certificates.secrets_group.invalid({
              secrets_group: "",
            }),
            "it should not be valid"
          );
          assert.isFalse(
            craig.secrets_manager.certificates.secrets_group.invalid({
              type: "root_ca",
            }),
            "it should not be valid"
          );
        });
        it("should handle signing method validation", () => {
          assert.isFalse(
            craig.secrets_manager.certificates.signing_method.invalid({
              signing_method: "",
            }),
            "it should be valid"
          );
          assert.isTrue(
            craig.secrets_manager.certificates.signing_method.invalid({
              type: "intermediate_ca",
            }),
            "it should not be valid"
          );
          assert.isFalse(
            craig.secrets_manager.certificates.signing_method.hideWhen({
              type: "intermediate_ca",
            }),
            "it should not be valid"
          );
        });
      });
    });
    describe("disableSave", () => {
      it("should disable save when a cert has a duplicate name", () => {
        craig.secrets_manager.create({ name: "default" });
        craig.secrets_manager.certificates.create(
          { name: "group" },
          {
            innerFormProps: {
              arrayParentName: "default",
            },
          }
        );
        assert.isTrue(
          disableSave(
            "certificates",
            { name: "group" },
            {
              craig: craig,
              arrayParentName: "default",
              data: {
                name: "frog",
              },
            }
          ),
          "it should be disabled"
        );
      });
    });
  });
});
