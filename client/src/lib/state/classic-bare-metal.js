const { isNullOrEmptyString } = require("lazy-z");
const {
  nameField,
  unconditionalInvalidText,
  fieldIsNullOrEmptyString,
  classicDatacenterField,
  domainField,
  classicPrivateNetworkOnly,
  classicPrivateVlan,
  classicPublicVlan,
} = require("./reusable-fields");
const { shouldDisableComponentSave, onArrayInputChange } = require("./utils");

/**
 * init store
 * @param {*} store
 */
function initClassicBareMetalStore(store) {
  store.newField("classic_bare_metal", {
    init: function (config) {
      config.store.json.classic_bare_metal = [];
    },
    onStoreUpdate: function (config) {
      if (!config.store.json.classic_bare_metal) {
        config.store.json.classic_bare_metal = [];
      }
    },
    create: function (config, stateData, componentProps) {
      config.push(["json", "classic_bare_metal"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "classic_bare_metal"],
        componentProps.data.name,
        stateData
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(["json", "classic_bare_metal"], componentProps.data.name);
    },
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "domain",
        "datacenter",
        "os_key_name",
        "package_key_name",
        "process_key_name",
        "public_vlan",
        "private_vlan",
        "disk_key_names",
      ],
      "classic_bare_metal"
    ),
    schema: {
      name: nameField("classic_bare_metal", {
        size: "small",
      }),
      domain: domainField(),
      datacenter: classicDatacenterField(),
      os_key_name: {
        size: "small",
        labelText: "OS Key Name",
        invalid: (stateData) => {
          return isNullOrEmptyString(stateData.os_key_name);
        },
        invalidText: unconditionalInvalidText("Enter an OS Key Name"),
        default: "",
        tooltip: {
          content:
            "The operating system key name that you want to use to provision the computing instance. To get OS key names, find the package key name in the IBM Cloud Classic API.",
          align: "right",
          alignModal: "right",
        },
      },
      package_key_name: {
        default: "",
        size: "small",
        invalid: fieldIsNullOrEmptyString("package_key_name"),
        invalidText: unconditionalInvalidText("Enter a Package Key Name"),
        tooltip: {
          content:
            "The key name for the monthly Bare Metal server's package. You can find available package key names in the IBM Cloud Classic API'",
          align: "right",
        },
      },
      process_key_name: {
        default: "",
        size: "small",
        invalid: fieldIsNullOrEmptyString("process_key_name"),
        invalidText: unconditionalInvalidText("Enter a Process Key Name"),
        tooltip: {
          content:
            "The key name for the monthly Bare Metal server's process. To get a process key name, find the package key name in the IBM Cloud Classic API",
          align: "right",
        },
      },
      memory: {
        size: "small",
        default: "",
        labelText: "Memory (GB)",
        placeholder: "64",
      },
      network_speed: {
        size: "small",
        default: "",
        labelText: "Network Speed (Mbs)",
        placeholder: "100",
      },
      disk_key_names: {
        placeholder: "disk-key-1, disk-key-2",
        default: [],
        type: "textArea",
        labelText: "Disk Key Names",
        invalid: function (stateData, componentProps) {
          return (
            !stateData.disk_key_names || stateData.disk_key_names.length === 0
          );
        },
        invalidText: unconditionalInvalidText(
          "Enter a comma separated list of disk key names"
        ),
        helperText: unconditionalInvalidText(
          "Enter a comma separated list of disk key names"
        ),
        onInputChange: onArrayInputChange("disk_key_names"),
        tooltip: {
          content:
            "The internal key names for the monthly Bare Metal server's disk. To get disk key names, find the package key name in the IBM Cloud Classic API",
          align: "right",
          alignModal: "right",
        },
      },
      private_network_only: classicPrivateNetworkOnly(),
      private_vlan: classicPrivateVlan(),
      public_vlan: classicPublicVlan(),
      public_bandwidth: {
        default: "",
        placeholder: "500",
        size: "small",
        labelText: "Public Bandwidth (GB/month)",
        hideWhen: function (stateData) {
          return stateData.private_network_only;
        },
      },
    },
  });
}

module.exports = {
  initClassicBareMetalStore,
};
