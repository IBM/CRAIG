const { assert } = require("chai");
const { disableSave } = require("../../../client/src/lib");

describe("vsi", () => {
  const example_vsi = {
    kms: null,
    encryption_key: "key",
    image: "ibm-centos-stream-8-amd64-1",
    profile: "bx2-2x8",
    name: "testing",
    security_groups: ["management-vpe"],
    ssh_keys: ["ssh-key"],
    vpc: "management",
    vsi_per_subnet: 1,
    resource_group: "service-rg",
    override_vsi_name: null,
    user_data: null,
    network_interfaces: [],
    subnets: ["vpe-zone-1"],
    volumes: [],
    subnet: "",
    image_name:
      "CentOS Stream 8 - Minimal Install (amd64) [ibm-centos-stream-8-amd64-1]",
    enable_floating_ip: false,
  };
  it("should return true if a vsi volume has an invalid name", () => {
    assert.isTrue(
      disableSave(
        "volumes",
        {
          name: "@@@",
        },
        {
          craig: {
            store: {
              json: {
                vsi: [
                  {
                    name: "frog",
                    volumes: [],
                  },
                  {
                    name: "toad",
                    volumes: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "aaaa",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return true if a vsi volume has an invalid capacity", () => {
    assert.isTrue(
      disableSave(
        "volumes",
        {
          name: "good-name",
          capacity: "1",
        },
        {
          craig: {
            store: {
              json: {
                vsi: [
                  {
                    name: "frog",
                    volumes: [],
                  },
                  {
                    name: "toad",
                    volumes: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "aaaa",
          },
        }
      ),
      "it should be true"
    );
  });
  it("should return false if a vsi volume has no capacity but is valid otherwise", () => {
    assert.isFalse(
      disableSave(
        "volumes",
        {
          name: "good-name",
          encryption_key: "good-key",
          capacity: "",
        },
        {
          craig: {
            store: {
              json: {
                vsi: [
                  {
                    name: "frog",
                    volumes: [],
                  },
                  {
                    name: "toad",
                    volumes: [],
                  },
                ],
              },
            },
          },
          data: {
            name: "aaaa",
          },
        }
      ),
      "it should be false"
    );
  });
  it("should return true if vsi has invalid name", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.name = "";
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty resource group", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.resource_group = null;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty vpc", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.vpc = null;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty image name", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.image_name = null;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty profile", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.profile = null;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty encryption key", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.encryption_key = null;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has invalid vsis per subnet", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.vsi_per_subnet = 0;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has invalid vsis per subnet", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.vsi_per_subnet = 11;
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty security groups", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.security_groups = [];
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty subnets", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.subnets = [];
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  it("should return true if vsi has empty ssh keys", () => {
    let vsi = Object.assign({}, example_vsi);
    vsi.ssh_keys = [];
    assert.isTrue(
      disableSave("vsi", vsi, {
        craig: { store: { json: { vsi: [{ name: "hi" }] } } },
        data: { name: "vsi" },
      })
    );
  });
  describe("f5_vsi_template", () => {
    const example_template = {
      app_id: "null",
      as3_declaration_url: "http://www.test.com/",
      default_route_gateway_cidr: "10.10.10.10/24",
      do_declaration_url: "http://www.test.com/",
      domain: "local",
      hostname: "f5-ve-01",
      license_host: "null",
      license_password: "null",
      license_pool: "null",
      license_sku_keyword_1: "null",
      license_sku_keyword_2: "null",
      license_type: "none",
      license_username: "null",
      phone_home_url: "http://www.test.com/",
      template_version: "20210201",
      tgactive_url: "http://www.test.com/",
      tgrefresh_url: "http://www.test.com/",
      tgstandby_url: "http://www.test.com/",
      tmos_admin_password: null,
      ts_declaration_url: "http://www.test.com/",
      vpc: "edge",
      zone: 1,
      template_source: "test",
    };
    it("should return true if any fields are empty, based on license_type none", () => {
      let template = Object.assign({}, example_template);
      template.template_version = "";
      template.template_source = "";
      assert.isTrue(disableSave("f5_vsi_template", template));
    });
    it("should return true if any fields are empty, based on license_type byol", () => {
      let template = Object.assign({}, example_template);
      template.license_type = "byol";
      template.byol_license_basekey = "";
      assert.isTrue(disableSave("f5_vsi_template", template));
    });
    it("should return true if any fields are empty, based on license_type regkeypool", () => {
      let template = Object.assign({}, example_template);
      template.license_type = "regkeypool";
      template.license_username = "";
      template.license_host = "";
      template.license_pool = "";
      assert.isTrue(disableSave("f5_vsi_template", template));
    });
    it("should return true if any fields are empty, based on license_type utilitypool", () => {
      let template = Object.assign({}, example_template);
      template.license_type = "utilitypool";
      template.license_unit_of_measure = "";
      assert.isTrue(disableSave("f5_vsi_template", template));
    });
    it("should return true if any of the urls are invalid", () => {
      let template = Object.assign({}, example_template);
      template.ts_declaration_url = "not a url";
      assert.isTrue(disableSave("f5_vsi_template", template));
    });
    it("should return false if all valid", () => {
      let template = Object.assign({}, example_template);
      assert.isFalse(disableSave("f5_vsi_template", template));
    });
  });
});
