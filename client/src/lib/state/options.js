const {
  revision,
  azsort,
  isEmpty,
  buildNumberDropdownList,
  titleCase,
  contains,
  isNullOrEmptyString,
} = require("lazy-z");
const { subnetTierSave } = require("./vpc/vpc");
const { RegexButWithWords } = require("regex-but-with-words");
const { invalidNewResourceName, invalidTagList } = require("../forms");
const releaseNotes = require("../docs/release-notes.json");
const {
  shouldDisableComponentSave,
  unconditionalInvalidText,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  kebabCaseInput,
  onArrayInputChange,
} = require("./utils");

const powerVsZones = [
  "au-syd",
  "us-south",
  "eu-de",
  "eu-gb",
  "eu-es",
  "us-east",
  "br-sao",
  "jp-tok",
  "ca-tor",
];

/**
 * initialize options
 * @param {lazyZstate} config
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function optionsInit(config) {
  config.store.json._options = {
    prefix: "iac",
    region: "us-south",
    tags: ["hello", "world"],
    zones: 3,
    endpoints: "private",
    account_id: "",
    fs_cloud: false,
    enable_classic: false,
    dynamic_subnets: true,
    enable_power_vs: false,
    power_vs_zones: [],
    craig_version: releaseNotes[0].version,
  };
}

/**
 * update existing options
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function optionsSave(config, stateData, componentProps) {
  if (componentProps.data.dynamic_subnets && !stateData.dynamic_subnets) {
    config.store.json.vpcs.forEach((vpc) => {
      vpc.address_prefixes = [];
      vpc.subnets.forEach((subnet) => {
        vpc.address_prefixes.push({
          name: subnet.name,
          cidr: subnet.cidr,
          zone: subnet.zone,
          vpc: vpc.name,
        });
      });
    });
  }
  if (stateData.showModal !== undefined) {
    delete stateData.showModal;
  }
  if (
    contains(config.store.json.atracker.locations, componentProps.data.region)
  ) {
    config.store.json.atracker.locations =
      config.store.json.atracker.locations.map((location) => {
        if (location === componentProps.data.region) return stateData.region;
        else return location;
      });
  }
  config.updateChild(["json", "_options"], componentProps.data.name, stateData);
  if (stateData.zones !== componentProps.data.zones) {
    let zones = config.store.json._options.zones;
    let vpcs = Object.keys(config.store.subnetTiers);
    vpcs.forEach((vpc) => {
      config.store.subnetTiers[vpc].forEach((subnetTier) => {
        let newSubnetTier = subnetTier;
        newSubnetTier.zones = zones; // update zones
        newSubnetTier.networkAcl = new revision(config.store.json)
          .child("vpcs", vpc, "name")
          .data.subnets.forEach((subnet) => {
            if (
              subnet.name.match(
                new RegexButWithWords()
                  .stringBegin()
                  .literal(subnetTier.name)
                  .literal("-zone-")
                  .digit()
                  .stringEnd()
                  .done("g")
              ) !== null
            ) {
              newSubnetTier.networkAcl = subnet.network_acl;
            }
          });
        // need to update list of subnets
        subnetTierSave(config, newSubnetTier, {
          data: subnetTier,
          vpc_name: vpc,
          craig: config,
        });
      });
    });
  }
}

/**
 * hide a field when power vs not enabled
 * @param {*} stateData
 * @param {*} componentProps
 * @returns {boolean} true when not enabled
 */
function hideWhenNotPowerVs(stateData) {
  return stateData.enable_power_vs !== true;
}

/**
 * init options store
 * @param {*} store
 */
function initOptions(store) {
  store.newField("options", {
    init: optionsInit,
    save: optionsSave,
    shouldDisableSave: shouldDisableComponentSave(
      ["prefix", "tags", "power_vs_zones", "region"],
      "options"
    ),
    schema: {
      fs_cloud: {
        type: "toggle",
        default: false,
        labelText: "Use FS Cloud",
        tooltip: {
          content: "Show only Financial Services Cloud validated regions.",
        },
      },
      prefix: {
        default: "iac",
        invalid: function (stateData, componentProps) {
          return (
            (stateData.prefix || "").length > 16 ||
            invalidNewResourceName(stateData.prefix)
          );
        },
        invalidText: unconditionalInvalidText("Invalid Prefix"),
        tooltip: {
          content:
            "A prefix of up to 16 characters that will begin the name of each resource provisioned by this template",
          align: "right",
        },
        size: "small",
      },
      region: {
        default: "",
        invalid: fieldIsNullOrEmptyString("region"),
        invalidText: selectInvalidText("region"),
        groups: function (stateData) {
          return ["us-south", "us-east", "eu-de", "eu-gb", "eu-es"]
            .concat(
              stateData.fs_cloud
                ? []
                : ["jp-tok", "jp-osa", "au-syd", "ca-tor", "br-sao"]
            )
            .sort(azsort);
        },
        onInputChange: function (stateData) {
          stateData.power_vs_zones = [];
          return stateData.region;
        },
        type: "select",
        size: "small",
      },
      zones: {
        default: "3",
        type: "select",
        labelText: "Availability Zones",
        groups: buildNumberDropdownList(3, 1),
        tooltip: {
          content: "The number of availability zones for VPCs in your template",
        },
        size: "small",
      },
      endpoints: {
        labelText: "Service Endpoints",
        default: "Private",
        type: "select",
        tooltip: {
          content:
            "Type of service endpoints to use for each service. Private endpoints are only supported for use with IBM Schematics.",
        },
        groups: ["Private", "Public", "Public and Private"],
        onRender: function (stateData) {
          return titleCase(stateData.endpoints).replace(/And/g, "and");
        },
        onInputChange: kebabCaseInput("endpoints"),
        size: "small",
      },
      account_id: {
        size: "small",
        default: "",
        optional: true,
        placeholder: "(Optional) Account ID",
        tooltip: {
          content:
            "Account ID is used to create some resources, such as Virtual Private Endpoints for Secrets Manager",
        },
        labelText: "Account ID",
      },
      dynamic_subnets: {
        size: "small",
        labelText: "VPC Network Address Management",
        type: "toggle",
        default: true,
        useOnOff: true,
        labelA: "aaa",
        disabled: function (stateData, componentProps) {
          return (
            componentProps.craig.store.json._options.advanced_subnets || false
          );
        },
        tooltip: {
          content:
            "CRAIG managed subnet addresses will try and minimize the number of available IP addresses in VPC subnets. To bring your own network addresses, turn this setting off.",
        },
      },
      enable_power_vs: {
        size: "small",
        type: "toggle",
        default: false,
        labelText: "Enable Power Virtual Servers",
        onStateChange: function (stateData) {
          if (stateData.enable_power_vs) {
            stateData.power_vs_zones = [];
            stateData.enable_power_vs = false;
          } else {
            stateData.enable_power_vs = true;
          }
        },
      },
      power_vs_high_availability: {
        size: "small",
        type: "toggle",
        default: false,
        labelText: "High Availability",
        tooltip: {
          content:
            "Enable High Availability and Disaster Recovery for Power VS by using enabled zones Dallas 12 and Washington DC 6",
        },
        hideWhen: hideWhenNotPowerVs,
        onStateChange: function (stateData) {
          if (!stateData.power_vs_high_availability) {
            stateData.power_vs_high_availability = true;
            stateData.power_vs_zones = ["dal12", "wdc06"];
          } else {
            stateData.power_vs_high_availability = false;
            stateData.power_vs_zones = [];
          }
        },
      },
      power_vs_zones: {
        size: "small",
        type: "multiselect",
        labelText: "Power VS Zones",
        hideWhen: hideWhenNotPowerVs,
        default: [],
        forceUpdateKey: function (stateData) {
          return (
            String(stateData.power_vs_high_availability) + stateData.region
          );
        },
        invalid: function (stateData) {
          return (
            stateData.enable_power_vs &&
            (!stateData.power_vs_zones ||
              isEmpty(stateData.power_vs_zones) ||
              !contains(powerVsZones, stateData.region))
          );
        },
        invalidText: function (stateData) {
          return !contains(powerVsZones, stateData.region)
            ? `The region ${stateData.region} does not have any available Power VS zones`
            : "Select at least one Availability Zone";
        },
        groups: function (stateData) {
          return stateData.power_vs_high_availability
            ? ["dal12", "wdc06"]
            : {
                "au-syd": ["syd04", "syd05"],
                "eu-de": ["eu-de-1", "eu-de-2"],
                "eu-gb": ["lon04", "lon06"],
                "eu-es": ["mad02", "mad04"],
                "us-east": ["us-east", "wdc06", "wdc07"],
                "us-south": ["us-south", "dal10", "dal12"],
                "jp-tok": ["tok04"],
                "br-sao": ["sao01", "sao04"],
                "ca-tor": ["tor01"],
              }[stateData.region];
        },
      },
      enable_classic: {
        type: "toggle",
        default: false,
        labelText: "Use Classic Resources",
      },
      tags: {
        placeholder: "hello,world",
        default: ["hello", "world"],
        type: "textArea",
        labelText: "Tags",
        invalid: function (stateData, componentProps) {
          return invalidTagList(stateData.tags);
        },
        invalidText: unconditionalInvalidText("One or more tags are invalid"),
        helperText: unconditionalInvalidText(
          "Enter a comma separated list of tags"
        ),
        onInputChange: onArrayInputChange("tags"),
        tooltip: {
          content:
            "Tags are used to identify resources. These tags will be added to each resource in your configuration that supports tags",
          align: "right",
        },
      },
    },
  });
}

module.exports = {
  optionsInit,
  optionsSave,
  initOptions,
};
