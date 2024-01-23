const { nestedSplat, transpose } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { newDefaultKms } = require("./defaults");
const {
  setUnfoundResourceGroup,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
} = require("./store.utils");
const {
  shouldDisableComponentSave,
  resourceGroupsField,
  unconditionalInvalidText,
  kebabCaseInput,
  titleCaseRender,
} = require("./utils");
const {
  invalidName,
  invalidNameText,
  invalidNewResourceName,
} = require("../forms");

/**
 * initialize key management in slz store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function keyManagementInit(config) {
  config.store.json.key_management = newDefaultKms();
  // push roks key
  config.store.json.key_management[0].keys.push({
    key_ring: "ring",
    name: "roks-key",
    root_key: true,
    force_delete: null,
    endpoint: null,
    rotation: 1,
    dual_auth_delete: false,
  });
  setEncryptionKeys(config);
}

/**
 * update key management store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 */
function keyManagementOnStoreUpdate(config) {
  setEncryptionKeys(config);
  config.store.json.key_management.forEach((kms) => {
    setUnfoundResourceGroup(config, kms);
    if (!kms.keys) {
      kms.keys = [];
    }
  });
}

/**
 * save key management
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {object} stateData component state data
 * @param {boolean} stateData.use_hs_crypto
 * @param {boolean} stateData.use_data
 * @param {string} stateData.name
 * @param {string} stateData.resource_group
 */
function keyManagementSave(config, stateData, componentProps) {
  let keyManagementData = {
    // set to true if use hs crypto
    name: stateData.name,
    resource_group: stateData.resource_group,
    use_hs_crypto: stateData.use_hs_crypto || false,
    authorize_vpc_reader_role: stateData.authorize_vpc_reader_role,
    use_data: stateData.use_hs_crypto ? true : stateData.use_data || false,
  };

  ["clusters", "vsi", "f5_vsi", "secrets_manager", "object_storage"].forEach(
    (item) => {
      config.store.json[item].forEach((resource) => {
        if (resource.kms === componentProps.data.name)
          resource.kms = stateData.name;
      });
    }
  );

  config.updateChild(
    ["json", "key_management"],
    componentProps.data.name,
    keyManagementData
  );
}

/**
 * create a new key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function keyManagementCreate(config, stateData) {
  config.push(["json", "key_management"], stateData);
}

/**
 * delete key management
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function keyManagementDelete(config, stateData, componentProps) {
  config.carve(["json", "key_management"], componentProps.data.name);
}

/**
 * set encryption keys for slz store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<object>} config.store.key_management.keys
 */
function setEncryptionKeys(config) {
  if (config.store.json.key_management.length > 0) {
    // if there is a kms service
    config.store.encryptionKeys = nestedSplat(
      config.store.json.key_management.filter((kms) => {
        if (kms.keys) {
          return kms;
        }
      }),
      "keys",
      "name"
    );
  } else {
    config.store.encryptionKeys = [];
  }
}

/**
 * create new kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 */
function kmsKeyCreate(config, stateData, componentProps) {
  let params = stateData;
  let newKey = {
    name: `new-key`,
    root_key: true,
    key_ring: null,
    force_delete: null,
    endpoint: null,
    rotation: 1,
    dual_auth_delete: false,
  };
  transpose(params, newKey);
  pushToChildFieldModal(
    config,
    "key_management",
    "keys",
    newKey,
    componentProps
  );
}

/**
 * update kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 * @param {number} stateData.interval_month rotation interval
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function kmsKeySave(config, stateData, componentProps) {
  ["vsi", "clusters"].forEach((item) => {
    config.store.json[item].forEach((resource) => {
      if (resource.encryption_key === componentProps.data.name)
        resource.encryption_key = stateData.name;
    });
  });
  config.store.json.object_storage.forEach((cos) => {
    cos.buckets.forEach((bucket) => {
      if (bucket.kms_key === componentProps.data.name)
        bucket.kms_key = stateData.name;
    });
  });
  updateSubChild(config, "key_management", "keys", stateData, componentProps);
}

/**
 * delete a kms key
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.key_management
 * @param {Array<string>} config.store.json.key_management.keys
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function kmsKeyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "key_management", "keys", componentProps);
}

/**
 * init key management store
 * @param {*} store
 */
function initKeyManagement(store) {
  store.newField("key_management", {
    init: keyManagementInit,
    onStoreUpdate: keyManagementOnStoreUpdate,
    save: keyManagementSave,
    create: keyManagementCreate,
    delete: keyManagementDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group"],
      "key_management"
    ),
    schema: {
      use_hs_crypto: {
        default: false,
        type: "select",
        labelText: "Key Management System",
        groups: ["HPCS", "Key Protect"],
        onRender: function (stateData) {
          return stateData.use_hs_crypto ? "HPCS" : "Key Protect";
        },
        onInputChange: function (stateData) {
          stateData.use_data = stateData.use_hs_crypto === "HPCS";
          return stateData.use_data;
        },
      },
      use_data: {
        type: "toggle",
        default: false,
        labelText: "Use Existing Instance",
        tooltip: {
          content: "Get Key Management from Data Source",
          align: "bottom-left",
        },
        disabled: function (stateData) {
          return stateData.use_hs_crypto;
        },
      },
      name: {
        default: "",
        invalid: invalidName("key_management"),
        invalidText: invalidNameText("key_management"),
      },
      resource_group: resourceGroupsField(),
      authorize_vpc_reader_role: {
        type: "toggle",
        default: true,
        tooltip: {
          content:
            "Allow for IAM Authorization policies to be created to allow this Key Management service to encrypt VPC block storage volumes. This should be false only if these policies already exist within your account.",
          align: "bottom-left",
        },
        labelText: "Authorize VPC Reader Role",
      },
    },
    subComponents: {
      keys: {
        create: kmsKeyCreate,
        delete: kmsKeyDelete,
        save: kmsKeySave,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "key_ring", "endpoint"],
          "key_management",
          "keys"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("encryption_keys"),
            invalidText: invalidNameText("encryption_keys"),
          },
          key_ring: {
            default: "",
            invalid: function (stateData) {
              return (
                stateData.key_ring !== "" &&
                invalidNewResourceName(stateData.key_ring)
              );
            },
            invalidText: unconditionalInvalidText(
              "Enter a valid key ring name"
            ),
          },
          endpoint: {
            type: "select",
            default: "",
            invalid: function (stateData) {
              return stateData.endpoint === "public-and-private";
            },
            invalidText: unconditionalInvalidText("Select an endpoint"),
            hideWhen: function (stateData, componentProps) {
              return (
                componentProps.craig.store.json._options.endpoints !==
                "public-and-private"
              );
            },
            groups: ["Public", "Private"],
            onRender: titleCaseRender("endpoint"),
            onInputChange: kebabCaseInput("endpoint"),
          },
          rotation: {
            type: "select",
            default: "1",
            labelText: "Rotation Interval (Months)",
            groups: [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "10",
              "11",
              "12",
            ],
            tooltip: {
              content:
                "Setting a rotation policy shortens the lifetime of the key at regular intervals. When it's time to rotate the key based on the rotation interval that you specify, the root key will be automatically replaced with new key material.",
              align: "bottom-left",
              alignModal: "bottom-left",
            },
            hideWhen: function (stateData) {
              return stateData.root_key === false;
            },
          },
          force_delete: {
            type: "toggle",
            default: false,
            labelText: "Force Deletion of Encryption Key",
            tooltip: {
              content:
                "Force deletion of a key refers to the deletion of any key that's actively protecting any registered cloud resources. KMS keys can be force-deleted by managers of the instance. However, the force-delete won't succeed if the key's associated resource is non-erasable due to a retention policy.",
              align: "bottom-left",
              alignModal: "right",
            },
          },
          dual_auth_delete: {
            type: "toggle",
            default: false,
            labelText: "Dual Authorization Deletion Policy",
            tooltip: {
              content:
                "Allow key to be deleted only by two users. One user can schedule the key for deletion, a second user must confirm it before the key will be destroyed.",
              align: "bottom-left",
              alignModal: "left",
            },
          },
          root_key: {
            type: "toggle",
            default: true,
            labelText: "Set as Root Key",
            tooltip: {
              content:
                "Root keys are symmetric key-wrapping keys used as roots of trust for encrypting/decrypting other keys. Can be either imported or generated by IBM Key Protect.",
              link: "https://cloud.ibm.com/docs/key-protect?topic=key-protect-envelope-encryption",
              align: "bottom-left",
              alignModal: "right",
            },
          },
        },
      },
    },
  });
}

module.exports = {
  keyManagementInit,
  keyManagementOnStoreUpdate,
  keyManagementSave,
  keyManagementCreate,
  keyManagementDelete,
  kmsKeyCreate,
  kmsKeySave,
  kmsKeyDelete,
  initKeyManagement,
};
