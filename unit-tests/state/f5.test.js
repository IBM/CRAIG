const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("f5", () => {
  describe("f5.init", () => {
    it("should initialize f5 vsi to empty array", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.json.f5_vsi,
        [],
        "it should create empty array"
      );
    });
  });
  describe("f5.onStoreUpdate", () => {
    it("should set all dependent fields to string or empty array when unfound vpc", () => {
      let state = new newState();
      state.createEdgeVpc("vpn-and-waf", false, 3);
      state.f5.vsi.create({ edgeType: "edge", zones: 2 });
      state.store.json.f5_vsi[0].vpc = null;
      state.update();
      assert.deepEqual(
        state.store.json.f5_vsi[0],
        {
          kms: "kms",
          encryption_key: "vsi-volume-key",
          image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
          profile: "cx2-4x8",
          name: "f5-zone-1",
          subnet: null,
          resource_group: "edge-rg",
          security_groups: ["f5-management-sg"],
          network_interfaces: [],
          ssh_keys: ["ssh-key"],
          vpc: null,
          template: {
            app_id: "null",
            as3_declaration_url: "null",
            default_route_gateway_cidr: "10.10.10.10/24",
            do_declaration_url: "null",
            domain: "local",
            template_source:
              "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
            hostname: "f5-ve-01",
            license_host: "null",
            license_password: "null",
            license_pool: "null",
            license_sku_keyword_1: "null",
            license_sku_keyword_2: "null",
            license_type: "none",
            license_username: "null",
            phone_home_url: "null",
            template_version: "20210201",
            tgactive_url: "null",
            tgrefresh_url: "null",
            tgstandby_url: "null",
            tmos_admin_password: null,
            ts_declaration_url: "null",
            vpc: null,
            zone: 1,
          },
        },
        "it should set fields"
      );
    });
    it("should update vsi with unfound ssh keys, unfound primary subnet names, and unfound network int. subnet", () => {
      let state = new newState();
      state.createEdgeVpc("vpn-and-waf", false, 3);
      state.f5.vsi.create(false, 2);
      state.store.json.f5_vsi[0].ssh_keys = ["bad-key"];
      state.store.json.f5_vsi[0].network_interfaces.unshift("todd");
      state.update();
      assert.isEmpty(
        state.store.json.f5_vsi[0].ssh_keys,
        "it should have no keys"
      );
    });
  });
  describe("f5.template.save", () => {
    it("should save template for an f5 vsi", () => {
      let state = new newState();
      state.createEdgeVpc("vpn-and-waf", false, 3);
      state.f5.vsi.create({ edgeType: "edge", zones: 2 });
      state.f5.template.save(
        {
          app_id: "hi",
          as3_declaration_url: "null",
          default_route_gateway_cidr: "10.10.10.10/24",
          do_declaration_url: "null",
          domain: "local",
          hostname: "f5-ve-01",
          license_host: "null",
          license_password: "null",
          template_source:
            "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
          license_pool: "null",
          license_sku_keyword_1: "null",
          license_sku_keyword_2: "null",
          license_type: "none",
          license_username: "todd",
          phone_home_url: "null",
          template_version: "20210201",
          tgactive_url: "null",
          tgrefresh_url: "null",
          tgstandby_url: "null",
          tmos_admin_password: null,
          ts_declaration_url: "null",
          vpc: "edge",
          zone: 1,
        },
        { data: { name: "f5-zone-1" } }
      );
      assert.deepEqual(
        state.store.json.f5_vsi[0],
        {
          kms: "kms",
          image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
          encryption_key: "vsi-volume-key",
          profile: "cx2-4x8",
          name: "f5-zone-1",
          subnet: "f5-management-zone-1",
          resource_group: "edge-rg",
          security_groups: ["f5-management-sg"],
          ssh_keys: ["ssh-key"],
          vpc: "edge",
          network_interfaces: [
            {
              security_groups: ["f5-bastion-sg"],
              subnet: "f5-bastion-zone-1",
            },
            {
              security_groups: ["f5-external-sg"],
              subnet: "f5-external-zone-1",
            },
            {
              security_groups: ["f5-workload-sg"],
              subnet: "f5-workload-zone-1",
            },
          ],
          template: {
            app_id: "hi",
            as3_declaration_url: "null",
            default_route_gateway_cidr: "10.10.10.10/24",
            do_declaration_url: "null",
            domain: "local",
            hostname: "f5-ve-01",
            license_host: "null",
            license_password: "null",
            license_pool: "null",
            license_sku_keyword_1: "null",
            license_sku_keyword_2: "null",
            license_type: "none",
            license_username: "todd",
            template_source:
              "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
            phone_home_url: "null",
            template_version: "20210201",
            tgactive_url: "null",
            tgrefresh_url: "null",
            tgstandby_url: "null",
            tmos_admin_password: null,
            ts_declaration_url: "null",
            vpc: "edge",
            zone: 1,
          },
        },
        "it should set data"
      );
    });
  });
  it("should set tmos_admin_password to null when state data is empty string", () => {
    let state = new newState();
    state.createEdgeVpc("vpn-and-waf", false, 3);
    state.f5.vsi.create(false, 2);
    state.f5.template.save(
      { tmos_admin_password: "" },
      { data: { name: "f5-zone-1" } }
    );
    assert.deepEqual(
      state.store.json.f5_vsi[0].template.tmos_admin_password,
      null,
      "password should set to null"
    );
  });
  it("should stringify certain empty params", () => {
    let state = new newState();
    state.createEdgeVpc("vpn-and-waf", false, 3);
    state.f5.vsi.create(false, 2);
    state.f5.template.save(
      {
        tmos_admin_password: null,
        license_type: "none",
        default_route_gateway_cidr: "10.10.10.10/24",
        license_host: "",
        domain: "local",
        hostname: "f5-ve-01",
        license_password: "",
        license_pool: "",
        license_sku_keyword_1: "",
        license_sku_keyword_2: "",
        license_username: "",
        template_version: "20210201",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
        app_id: "",
        phone_home_url: "",
        do_declaration_url: "",
        as3_declaration_url: "",
        ts_declaration_url: "",
        tgstandby_url: "",
        tgrefresh_url: "",
        tgactive_url: "",
        vpc: "edge",
        zone: 1,
      },
      { data: { name: "f5-zone-1" } }
    );
    assert.deepEqual(
      state.store.json.f5_vsi[0].template,
      {
        tmos_admin_password: null,
        license_type: "none",
        default_route_gateway_cidr: "10.10.10.10/24",
        license_host: "null",
        domain: "local",
        hostname: "f5-ve-01",
        license_password: "null",
        license_pool: "null",
        license_sku_keyword_1: "null",
        license_sku_keyword_2: "null",
        license_username: "null",
        template_version: "20210201",
        app_id: "null",
        phone_home_url: "null",
        do_declaration_url: "null",
        as3_declaration_url: "null",
        ts_declaration_url: "null",
        template_source:
          "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
        tgstandby_url: "null",
        tgrefresh_url: "null",
        tgactive_url: "null",
        vpc: "edge",
        zone: 1,
      },
      'should set empty string to "null" string'
    );
  });
});
describe("f5.instance", () => {
  describe("f5.instance.save", () => {
    it("should set the resource group and encryption key for an f5 vsi", () => {
      let state = new newState();
      state.createEdgeVpc("vpn-and-waf", false, 3);
      state.f5.vsi.create({ edgeType: "edge", zones: 2 });
      state.f5.instance.save(
        {
          name: "f5-zone-1",
          resource_group: "frog",
          encryption_key: "todd",
        },
        { data: { name: "f5-zone-1" } }
      );
      assert.deepEqual(
        state.store.json.f5_vsi[0],
        {
          kms: "kms",
          image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
          encryption_key: null,
          profile: "cx2-4x8",
          name: "f5-zone-1",
          subnet: "f5-management-zone-1",
          resource_group: null,
          security_groups: ["f5-management-sg"],
          ssh_keys: ["ssh-key"],
          vpc: "edge",
          network_interfaces: [
            {
              security_groups: ["f5-bastion-sg"],
              subnet: "f5-bastion-zone-1",
            },
            {
              security_groups: ["f5-external-sg"],
              subnet: "f5-external-zone-1",
            },
            {
              security_groups: ["f5-workload-sg"],
              subnet: "f5-workload-zone-1",
            },
          ],
          template: {
            app_id: "null",
            as3_declaration_url: "null",
            default_route_gateway_cidr: "10.10.10.10/24",
            do_declaration_url: "null",
            domain: "local",
            hostname: "f5-ve-01",
            license_host: "null",
            license_password: "null",
            license_pool: "null",
            license_sku_keyword_1: "null",
            license_sku_keyword_2: "null",
            license_type: "none",
            license_username: "null",
            phone_home_url: "null",
            template_version: "20210201",
            template_source:
              "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
            tgactive_url: "null",
            tgrefresh_url: "null",
            tgstandby_url: "null",
            tmos_admin_password: null,
            ts_declaration_url: "null",
            vpc: "edge",
            zone: 1,
          },
        },
        "it should set data"
      );
    });
  });
  describe("f5.instance.schema", () => {
    it("should have invalid license_host", () => {
      let craig = state();
      assert.isTrue(
        craig.f5.template.license_host.invalid({ license_host: "" }),
        "it should be invalid"
      );
      assert.isTrue(
        craig.f5.template.license_pool.invalid({ license_pool: "" }),
        "it should be invalid"
      );
      assert.isFalse(
        craig.f5.template.template_version.invalid({ template_version: "" }),
        "it should be valid"
      );
    });
    it("should have invalid tmos_admin_password", () => {
      let craig = state();
      assert.isTrue(
        craig.f5.template.tmos_admin_password.invalid({
          tmos_admin_password: "",
        }),
        "it should be invalid when empty"
      );
      assert.isTrue(
        craig.f5.template.tmos_admin_password.invalid({
          tmos_admin_password: "aaa",
        }),
        "it should be invalid when not passing exp"
      );
    });
    it("should have invalid ts_declaration_url when not valid url", () => {
      let craig = state();
      assert.isTrue(
        craig.f5.template.ts_declaration_url.invalid({
          ts_declaration_url: "oops",
        }),
        "it should be invalid"
      );
    });
    it("should hide byol license base key when form type is not byol", () => {
      let craig = state();
      assert.isTrue(
        craig.f5.template.byol_license_basekey.hideWhen({
          license_type: "none",
        }),
        "it should be hidden"
      );
    });
    it("should not hide byol license base key when form type is byol", () => {
      let craig = state();
      assert.isFalse(
        craig.f5.template.byol_license_basekey.hideWhen({
          license_type: "byol",
        }),
        "it should be hidden"
      );
    });
  });
  describe("f5.vsi", () => {
    describe("f5.vsi.save", () => {
      it("should create new instances on change", () => {
        let state = new newState();
        state.createEdgeVpc("vpn-and-waf", false, 3);
        state.f5.vsi.create({ edgeType: "edge", zones: 2 });
        state.f5.vsi.save({
          zones: 1,
          image: "todd",
          resource_group: "service-rg",
          profile: "1x2x3x4",
          ssh_keys: ["ssh-key"],
        });
        assert.deepEqual(
          state.store.json.f5_vsi,
          [
            {
              kms: "kms",
              image: "todd",
              encryption_key: "vsi-volume-key",
              profile: "1x2x3x4",
              name: "f5-zone-1",
              subnet: "f5-management-zone-1",
              resource_group: "service-rg",
              security_groups: ["f5-management-sg"],
              ssh_keys: ["ssh-key"],
              vpc: "edge",
              network_interfaces: [
                {
                  security_groups: ["f5-bastion-sg"],
                  subnet: "f5-bastion-zone-1",
                },
                {
                  security_groups: ["f5-external-sg"],
                  subnet: "f5-external-zone-1",
                },
                {
                  security_groups: ["f5-workload-sg"],
                  subnet: "f5-workload-zone-1",
                },
              ],
              template: {
                app_id: "null",
                as3_declaration_url: "null",
                default_route_gateway_cidr: "10.10.10.10/24",
                do_declaration_url: "null",
                domain: "local",
                hostname: "f5-ve-01",
                license_host: "null",
                license_password: "null",
                license_pool: "null",
                license_sku_keyword_1: "null",
                license_sku_keyword_2: "null",
                license_type: "none",
                license_username: "null",
                phone_home_url: "null",
                template_version: "20210201",
                template_source:
                  "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
                tgactive_url: "null",
                tgrefresh_url: "null",
                tgstandby_url: "null",
                tmos_admin_password: null,
                ts_declaration_url: "null",
                vpc: "edge",
                zone: 1,
              },
            },
          ],
          "it should return correct vsi"
        );
      });
      it("should use default template if no pre-existing vsi", () => {
        let state = new newState();
        state.createEdgeVpc("vpn-and-waf", false, 3);
        state.f5.vsi.save({
          zones: 1,
          image: "todd",
          resource_group: "service-rg",
          profile: "1x2x3x4",
          ssh_keys: ["ssh-key"],
        });
        assert.deepEqual(
          state.store.json.f5_vsi,
          [
            {
              kms: "kms",
              image: "todd",
              encryption_key: "vsi-volume-key",
              profile: "1x2x3x4",
              name: "f5-zone-1",
              subnet: "f5-management-zone-1",
              resource_group: "service-rg",
              security_groups: ["f5-management-sg"],
              ssh_keys: ["ssh-key"],
              vpc: "edge",
              network_interfaces: [
                {
                  security_groups: ["f5-bastion-sg"],
                  subnet: "f5-bastion-zone-1",
                },
                {
                  security_groups: ["f5-external-sg"],
                  subnet: "f5-external-zone-1",
                },
                {
                  security_groups: ["f5-workload-sg"],
                  subnet: "f5-workload-zone-1",
                },
              ],
              template: {
                app_id: "null",
                as3_declaration_url: "null",
                default_route_gateway_cidr: "10.10.10.10/24",
                do_declaration_url: "null",
                domain: "local",
                hostname: "f5-ve-01",
                license_host: "null",
                license_password: "null",
                license_pool: "null",
                license_sku_keyword_1: "null",
                license_sku_keyword_2: "null",
                license_type: "none",
                license_username: "null",
                phone_home_url: "null",
                template_version: "20210201",
                template_source:
                  "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
                tgactive_url: "null",
                tgrefresh_url: "null",
                tgstandby_url: "null",
                tmos_admin_password: null,
                ts_declaration_url: "null",
                vpc: "edge",
                zone: 1,
              },
            },
          ],
          "it should return correct vsi"
        );
      });
      it("should retain template from existing vsi on save", () => {
        let state = new newState();
        state.createEdgeVpc("vpn-and-waf", false, 3);
        state.f5.vsi.create({ edgeType: "edge", zones: 2 });
        state.f5.template.save(
          {
            app_id: "hi",
            as3_declaration_url: "null",
            default_route_gateway_cidr: "10.10.10.10/24",
            do_declaration_url: "null",
            domain: "local",
            hostname: "f5-ve-01",
            license_host: "null",
            license_password: "null",
            template_source:
              "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
            license_pool: "null",
            license_sku_keyword_1: "null",
            license_sku_keyword_2: "null",
            license_type: "none",
            license_username: "todd",
            phone_home_url: "null",
            template_version: "20210201",
            tgactive_url: "null",
            tgrefresh_url: "null",
            tgstandby_url: "null",
            tmos_admin_password: null,
            ts_declaration_url: "null",
            vpc: "edge",
            zone: 1,
          },
          { data: { name: "f5-zone-1" } }
        );
        state.f5.vsi.save({
          zones: 1,
          image: "todd",
          resource_group: "service-rg",
          profile: "1x2x3x4",
          ssh_keys: ["ssh-key"],
        });
        assert.deepEqual(
          state.store.json.f5_vsi,
          [
            {
              kms: "kms",
              image: "todd",
              encryption_key: "vsi-volume-key",
              profile: "1x2x3x4",
              name: "f5-zone-1",
              subnet: "f5-management-zone-1",
              resource_group: "service-rg",
              security_groups: ["f5-management-sg"],
              ssh_keys: ["ssh-key"],
              vpc: "edge",
              network_interfaces: [
                {
                  security_groups: ["f5-bastion-sg"],
                  subnet: "f5-bastion-zone-1",
                },
                {
                  security_groups: ["f5-external-sg"],
                  subnet: "f5-external-zone-1",
                },
                {
                  security_groups: ["f5-workload-sg"],
                  subnet: "f5-workload-zone-1",
                },
              ],
              template: {
                app_id: "hi",
                as3_declaration_url: "null",
                default_route_gateway_cidr: "10.10.10.10/24",
                do_declaration_url: "null",
                domain: "local",
                hostname: "f5-ve-01",
                license_host: "null",
                license_password: "null",
                template_source:
                  "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
                license_pool: "null",
                license_sku_keyword_1: "null",
                license_sku_keyword_2: "null",
                license_type: "none",
                license_username: "todd",
                phone_home_url: "null",
                template_version: "20210201",
                tgactive_url: "null",
                tgrefresh_url: "null",
                tgstandby_url: "null",
                tmos_admin_password: null,
                ts_declaration_url: "null",
                vpc: "edge",
                zone: 1,
              },
            },
          ],
          "it should return correct vsi"
        );
      });
    });
    describe("f5.vsi.create", () => {
      it("should create a new ssh key if one is not found", () => {
        let state = new newState();
        state.createEdgeVpc("vpn-and-waf", false, 3);
        state.store.json.ssh_keys = [];
        state.f5.vsi.create({ edgeType: "edge", zones: 2 });
        assert.deepEqual(
          state.store.json.ssh_keys,
          [
            {
              name: "ssh-key",
              public_key: "<user-determined-value>",
              resource_group: null,
            },
          ],
          "it should return correct ssh key"
        );
      });
      it("should create a new encryption key for vsi if one is not found", () => {
        let state = new newState();
        state.createEdgeVpc("vpn-and-waf", false, 3);
        state.store.encryptionKeys = [];
        state.store.json.key_management[0].keys = [];
        state.f5.vsi.create({ edgeType: "edge", zones: 2 });
        assert.deepEqual(
          state.store.encryptionKeys,
          ["vsi-volume-key"],
          "it should return correct ssh key"
        );
      });
      it("should create an f5 vsi on management", () => {
        let state = new newState();
        state.createEdgeVpc("vpn-and-waf", true, 1);
        state.f5.vsi.create({ edgeType: "management", zones: 1 });
        assert.deepEqual(state.store.json.f5_vsi, [
          {
            kms: "kms",
            image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            encryption_key: "vsi-volume-key",
            profile: "cx2-4x8",
            name: "f5-zone-1",
            subnet: "f5-management-zone-1",
            resource_group: "management-rg",
            security_groups: ["f5-management-sg"],
            ssh_keys: ["ssh-key"],
            vpc: "management",
            network_interfaces: [
              {
                security_groups: ["f5-bastion-sg"],
                subnet: "f5-bastion-zone-1",
              },
              {
                security_groups: ["f5-external-sg"],
                subnet: "f5-external-zone-1",
              },
              {
                security_groups: ["f5-workload-sg"],
                subnet: "f5-workload-zone-1",
              },
            ],
            template: {
              app_id: "null",
              as3_declaration_url: "null",
              default_route_gateway_cidr: "10.10.10.10/24",
              do_declaration_url: "null",
              domain: "local",
              hostname: "f5-ve-01",
              license_host: "null",
              license_password: "null",
              license_pool: "null",
              license_sku_keyword_1: "null",
              license_sku_keyword_2: "null",
              license_type: "none",
              license_username: "null",
              phone_home_url: "null",
              template_version: "20210201",
              template_source:
                "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
              tgactive_url: "null",
              tgrefresh_url: "null",
              tgstandby_url: "null",
              tmos_admin_password: null,
              ts_declaration_url: "null",
              vpc: "management",
              zone: 1,
            },
          },
        ]);
      });
    });
    describe("f5.vsi.schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
      });
      it("should return false for ssh key invalid if zones is 0 and no ssh keys are selected", () => {
        assert.isFalse(
          craig.f5.vsi.ssh_keys.invalid({ zones: "0", ssh_keys: [] }),
          "it should be valid"
        );
      });
      it("should not have resource groups as invalid when no zones", () => {
        assert.isFalse(
          craig.f5.vsi.resource_group.invalid({ zones: "0", ssh_keys: [] }),
          "it should be valid"
        );
      });
      it("should have resource groups as invalid when  zones", () => {
        assert.isTrue(
          craig.f5.vsi.resource_group.invalid({ zones: "1", ssh_keys: [] }),
          "it should be valid"
        );
      });
      it("should have correct image groups", () => {
        assert.deepEqual(
          craig.f5.vsi.image.groups(),
          [
            "f5-bigip-15-1-5-1-0-0-14-all-1slot",
            "f5-bigip-15-1-5-1-0-0-14-ltm-1slot",
            "f5-bigip-16-1-2-2-0-0-28-ltm-1slot",
            "f5-bigip-16-1-2-2-0-0-28-all-1slot",
          ],
          "it should return list of images"
        );
      });
      it("should return api endpoint for image name with region", () => {
        assert.deepEqual(
          craig.f5.vsi.profile.apiEndpoint({}, { craig: craig }),
          "/api/vsi/us-south/instanceProfiles",
          "it should return api endpoint"
        );
      });
    });
  });
});
