const assert = require("assert");
const docs = require("../client/src/lib/docs/docs.json");
const {
  encryptionKeyFilter,
  filterDocs,
} = require("../client/src/lib/forms/filters");
describe("encryptionKeyFilter", () => {
  let craig;
  beforeEach(() => {
    craig = {
      store: {
        json: {
          object_storage: [
            { name: "cosName1", kms: "kms1" },
            { name: "cosName2", kms: null },
          ],
          key_management: [
            {
              name: "kms1",
              keys: [
                { name: "key1", root_key: true },
                { name: "key2", root_key: false },
              ],
            },
            {
              name: "kms2",
              keys: [{ name: "key3", root_key: false }],
            },
          ],
        },
      },
    };
  });
  it("should return an empty array if kms is falsy", () => {
    const componentProps = {
      isModal: false,
      arrayParentName: "cosName2",
      craig: craig,
    };
    const result = encryptionKeyFilter({}, componentProps);
    assert.deepEqual(result, []);
  });

  it("should return an array of key names for root keys when kmd is selected", () => {
    const componentProps = {
      isModal: true,
      parent_name: "cosName1",
      craig: craig,
    };
    const result = encryptionKeyFilter({}, componentProps);

    assert.deepEqual(result, ["key1"]);
  });
});

describe("filteredDocs", () => {
  it("should return entire docs object for the field if template is undefined", () => {
    const actualData = filterDocs(undefined, "resource_groups", docs);
    const expectedData = {
      content: [
        {
          text: "Resource groups aid in the organization of account resources in an IBM Cloud account.",
        },
        {
          text: "_default_includes",
          className: "marginBottomXs",
        },
        {
          templates: {
            "Empty Project": ["craig-rg"],
            "Power VS Quick Start": ["management-rg", "service-rg"],
            "Power VS Oracle Ready": [
              "management-rg",
              "service-rg",
              "workload-rg",
              "power-rg",
            ],
            Mixed: ["management-rg", "service-rg", "workload-rg"],
            "Power VS SAP Hana": ["management-rg", "service-rg", "workload-rg"],
            "VSI Edge": [
              "management-rg",
              "service-rg",
              "workload-rg",
              "edge-rg",
            ],
            VSI: ["management-rg", "service-rg", "workload-rg"],
            "VPN as a Service": ["vpnaas-rg"],
          },
          table: [
            ["Group Name", "Description", "Optional"],
            [
              "service-rg",
              "A resource group containing all IBM Cloud Services",
              "",
            ],
            [
              "management-rg",
              "A resource group containing the compute, storage, and network services to enable the application provider's administrators to monitor, operation, and maintain the environment",
              "",
            ],
            [
              "workload-rg",
              "A resource group containing the compute, storage, and network services to support hosted applications and operations that deliver services to the consumer",
              "",
            ],
            [
              "edge-rg",
              "A resource group containing the compute, storage, and network services necessary for edge networking",
              "true",
            ],
            ["craig-rg", "An example resource group", ""],
            ["power-rg", "A resource group for Power VS resources", ""],
            [
              "vpnaas-rg",
              "A resource group for cloud services and infrastructure management",
              "",
            ],
          ],
        },
      ],
      relatedLinks: [
        [
          "https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui",
          "Resource Group Documentation",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_group",
          "Resource Group Terraform Documentation",
        ],
      ],
      last_updated: "5/31/2023",
    };
    assert.deepEqual(actualData, expectedData);
  });
  it("should return docs with only the default resources for that template", () => {
    const actualData = filterDocs("Mixed", "resource_groups", docs);
    const expectedData = {
      content: [
        {
          text: "Resource groups aid in the organization of account resources in an IBM Cloud account.",
        },
        {
          text: "_default_includes",
          className: "marginBottomXs",
        },
        {
          templates: {
            "Empty Project": ["craig-rg"],
            "Power VS Quick Start": ["management-rg", "service-rg"],
            "Power VS Oracle Ready": [
              "management-rg",
              "service-rg",
              "workload-rg",
              "power-rg",
            ],
            Mixed: ["management-rg", "service-rg", "workload-rg"],
            "Power VS SAP Hana": ["management-rg", "service-rg", "workload-rg"],
            "VSI Edge": [
              "management-rg",
              "service-rg",
              "workload-rg",
              "edge-rg",
            ],
            VSI: ["management-rg", "service-rg", "workload-rg"],
            "VPN as a Service": ["vpnaas-rg"],
          },
          table: [
            ["Group Name", "Description", "Optional"],
            [
              "service-rg",
              "A resource group containing all IBM Cloud Services",
              "",
            ],
            [
              "management-rg",
              "A resource group containing the compute, storage, and network services to enable the application provider's administrators to monitor, operation, and maintain the environment",
              "",
            ],
            [
              "workload-rg",
              "A resource group containing the compute, storage, and network services to support hosted applications and operations that deliver services to the consumer",
              "",
            ],
          ],
        },
      ],
      relatedLinks: [
        [
          "https://cloud.ibm.com/docs/account?topic=account-rgs&interface=ui",
          "Resource Group Documentation",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_group",
          "Resource Group Terraform Documentation",
        ],
      ],
      last_updated: "5/31/2023",
    };
    assert.deepEqual(actualData, expectedData);
  });
  it("should return entire docs object for kms", () => {
    const actualData = filterDocs("VPN as a Service", "key_management", docs);
    const expectedData = {
      content: [
        {
          text: "A key management service is used to create, import, rotate, and manage encryption keys. By default a single instance is created, but users can add additional instances as needed.",
        },
        {
          text: "IBM Cloud offers two solutions for key management:",
          className: "marginBottomSmall",
        },
        {
          table: [
            ["Service Name", "Description"],
            [
              "IBM Cloud Hyper Protect Crypto Services (HPCS)",
              "A dedicated key management service and hardware security module (HSM) based on IBM Cloud. Built on FIPS 140-2 Level 4-certified hardware, this service allows users to take the ownership of the cloud HSM to fully manage encryption keys and perform cryptographic operations. Users cannot use SLZ to initialize HPCS. In order to use HPCS with Secure Landing Zone users will need to bring an existing instance.",
            ],
            [
              "IBM Cloud Key Protect",
              "A full-service encryption solution that allows data to be secured and stored in IBM Cloud using the latest envelope encryption techniques that leverage FIPS 140-2 Level 3 certified cloud-based hardware security modules.",
            ],
          ],
        },
        {
          text: "To be FS Cloud compliant, data at rest is to always be encrypted using your keys.",
        },
        {
          text: "_default_includes",
          className: "marginBottomSmall",
        },
        {
          templates: {
            "Empty Project": [],
            "Power VS Quick Start": ["key", "vsi-volume-key"],
            "Power VS Oracle Ready": ["key", "vsi-volume-key"],
            Mixed: ["key", "vsi-volume-key", "roks-key"],
            "Power VS SAP Hana": ["key", "vsi-volume-key", "roks-key"],
            "VSI Edge": ["key", "vsi-volume-key"],
            VSI: ["key", "vsi-volume-key"],
            "VPN as a Service": ["encryption-key"],
          },
          table: [
            ["Key Name", "Description"],
            ["encryption-key", "An encryption key for service instances"],
          ],
        },
        {
          text: "To allow keys from your Key Protect Service to encrypt VSI and VPC Block Storage Volumes. The creation of these service authorizations can be enabled and disabled with the Authorize VPC Reader Role toggle.",
        },
      ],
      relatedLinks: [
        [
          "https://cloud.ibm.com/docs/framework-financial-services?topic=framework-financial-services-shared-encryption-at-rest",
        ],
        [
          "https://cloud.ibm.com/docs/hs-crypto?topic=hs-crypto-get-started",
          "Get Started With HyperProtect Crypto Servies",
        ],
        [
          "https://cloud.ibm.com/docs/key-protect?topic=key-protect-about",
          "IBM Cloud Key Protect",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/resource_instance",
          "Resource Instance Terraform Documentation",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/kms_key",
          "Key Management Key Terraform Documentation",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/kms_key_policies",
          "Key Management Key Policy Terraform Documentation",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/kms_key_rings",
          "Key Management Key Ring Terraform Documentation",
        ],
      ],
      last_updated: "6/9/2023",
    };
    assert.deepEqual(actualData, expectedData);
  });
  it("should return entire docs object if default for template is not found", () => {
    const actualData = filterDocs("VPN as a service", "ssh_keys", docs);
    const expectedData = {
      relatedLinks: [
        ["https://cloud.ibm.com/docs/ssh-keys?topic=ssh-keys-about-ssh-keys"],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/resources/is_ssh_key",
          "VPC SSH Key Terraform Documentation",
        ],
        [
          "https://registry.terraform.io/providers/IBM-Cloud/ibm/latest/docs/data-sources/is_ssh_key",
          "VPC SSH Key Terraform Data Documentation",
        ],
      ],
      content: [
        {
          text: "SSH keys identify a user or device through public-key cryptography and allow access to a device without using a password. At least one SSH Key is required to create virtual server instances. Based on the pattern selected, an SSH key may or may not be configured automatically.",
          className: "marginBottomSmall",
        },
        {
          text: "_default_includes",
        },
        {
          templates: {
            "Empty Project": [],
            "Power VS Quick Start": ["ssh-key"],
            "Power VS Oracle Ready": ["ssh-key"],
            Mixed: ["ssh-key"],
            "Power VS SAP Hana": ["ssh-key"],
            "VSI Edge": ["ssh-key"],
            VSI: ["ssh-key"],
          },
          table: [
            ["SSH Key", "Description"],
            ["ssh-key", "An SSH key to use when provisioning VSI deployments."],
          ],
        },
      ],
      last_updated: "6/9/2023",
    };
    assert.deepEqual(actualData, expectedData);
  });
});
