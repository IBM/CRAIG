const { splatContains, isEmpty, splat } = require("lazy-z");
const {
  shouldDisableComponentSave,
  fieldIsNotWholeNumber,
} = require("./utils");
const {
  nameField,
  domainField,
  classicDatacenterField,
  classicPrivateVlan,
  classicPublicVlan,
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
  classicPrivateNetworkOnly,
  hideWhenFieldFalse,
} = require("./reusable-fields");

/**
 * init classic vsi
 * @param {*} store
 */
function initClassicVsi(store) {
  store.newField("classic_vsi", {
    init: function (config) {
      config.store.json.classic_vsi = [];
    },
    create: function (config, stateData, componentProps) {
      config.push(["json", "classic_vsi"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "classic_vsi"],
        componentProps.data.name,
        stateData
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(["json", "classic_vsi"], componentProps.data.name);
    },
    onStoreUpdate: function (config) {
      if (config.store.json.classic_vsi) {
        config.store.json.classic_vsi.forEach((vsi) => {
          ["public_vlan", "private_vlan"].forEach((field) => {
            if (
              !splatContains(
                config.store.json.classic_vlans,
                "name",
                vsi[field]
              )
            )
              vsi[field] = null;
          });
          let nextSgs = {
            public_security_groups: [],
            private_security_groups: [],
          };
          ["public_security_groups", "private_security_groups"].forEach(
            (field) => {
              vsi[field].forEach((item) => {
                if (
                  splatContains(
                    config.store.json.classic_security_groups,
                    "name",
                    item
                  )
                ) {
                  nextSgs[field].push(item);
                }
              });
              vsi[field] = nextSgs[field];
            }
          );
          let nextSshKeys = [];
          vsi.ssh_keys.forEach((key) => {
            if (
              splatContains(config.store.json.classic_ssh_keys, "name", key)
            ) {
              nextSshKeys.push(key);
            }
          });
          vsi.ssh_keys = nextSshKeys;
        });
      } else config.store.json.classic_vsi = [];
    },
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "datacenter",
        "domain",
        "cores",
        "memory",
        "image_id",
        "network_speed",
        "private_vlan",
        "public_vlan",
        "private_security_groups",
        "public_security_groups",
        "ssh_keys",
      ],
      "classic_vsi"
    ),
    schema: {
      name: nameField("classic_vsi", {
        size: "small",
      }),
      domain: domainField(),
      datacenter: classicDatacenterField(),
      private_vlan: classicPrivateVlan(),
      public_vlan: classicPublicVlan(),
      cores: {
        default: "",
        invalid: fieldIsNullOrEmptyString("cores"),
        size: "small",
      },
      memory: {
        default: "",
        labelText: "Memory (Mb)",
        invalid: fieldIsNullOrEmptyString("memory"),
        size: "small",
      },
      image_id: {
        default: "",
        labelText: "Image ID",
        invalid: fieldIsNullOrEmptyString("image_id"),
        size: "small",
      },
      network_speed: {
        default: "100",
        invalid: fieldIsNotWholeNumber("network_speed", 0, 10000),
        invalidText: unconditionalInvalidText("Must be a whole number"),
        size: "small",
      },
      local_disk: {
        type: "toggle",
        size: "small",
        labelText: "Local Disk",
      },
      private_network_only: classicPrivateNetworkOnly(),
      ssh_keys: {
        labelText: "SSH Keys",
        type: "multiselect",
        size: "small",
        default: [],
        invalid: function (stateData) {
          return !stateData.ssh_keys || isEmpty(stateData.ssh_keys);
        },
        invalidText: unconditionalInvalidText("Select at least one SSH key"),
        groups: function (stateData, componentProps) {
          return splat(
            componentProps.craig.store.json.classic_ssh_keys,
            "name"
          );
        },
      },
      private_security_groups: {
        type: "multiselect",
        size: "small",
        default: [],
        invalid: function (stateData) {
          return (
            !stateData.private_security_groups ||
            isEmpty(stateData.private_security_groups)
          );
        },
        invalidText: unconditionalInvalidText(
          "Select at least one security group"
        ),
        groups: function (stateData, componentProps) {
          return splat(
            componentProps.craig.store.json.classic_security_groups,
            "name"
          );
        },
      },
      public_security_groups: {
        type: "multiselect",
        size: "small",
        default: [],
        invalid: function (stateData) {
          return (
            !stateData.private_network_only &&
            (!stateData.public_security_groups ||
              isEmpty(stateData.public_security_groups))
          );
        },
        invalidText: unconditionalInvalidText(
          "Select at least one security group"
        ),
        groups: function (stateData, componentProps) {
          return splat(
            componentProps.craig.store.json.classic_security_groups,
            "name"
          );
        },
        hideWhen: hideWhenFieldFalse("private_network_only", true),
      },
    },
  });
}

module.exports = {
  initClassicVsi,
};
