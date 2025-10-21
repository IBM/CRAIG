/**
 * init class sg
 * @param {*} store
 */

const { isNullOrEmptyString, contains, validPortRange } = require("lazy-z");
const { invalidDescription } = require("../forms/invalid-callbacks");
const {
  nameField,
  unconditionalInvalidText,
  fieldIsNullOrEmptyString,
  selectInvalidText,
} = require("./reusable-fields");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
} = require("./store.utils");
const {
  shouldDisableComponentSave,
  titleCaseRender,
  kebabCaseInput,
} = require("./utils");

/**
 * port range field
 * @param {boolean} max
 * @returns {Object} object field
 */
function portRangeField(max) {
  return {
    default: "",
    hideWhen: function (stateData) {
      return !contains(["icmp", "udp", "tcp"], stateData.ruleProtocol);
    },
    invalid: function (stateData, componentProps) {
      let dataRef = stateData[max ? "port_range_max" : "port_range_min"];
      return isNullOrEmptyString(stateData?.ruleProtocol, true) ||
        stateData.ruleProtocol === "all" ||
        (stateData.ruleProtocol === "icmp" && dataRef === "0") // 0 is falsy
        ? false
        : isNullOrEmptyString(dataRef, true) || !Number(dataRef) // NaN results are falsy
          ? true
          : stateData.ruleProtocol === "icmp"
            ? !validPortRange(max ? "code" : "type", Number(dataRef))
            : !validPortRange("port_min", Number(dataRef));
    },
    invalidText: function (stateData) {
      return isNullOrEmptyString(stateData.ruleProtocol, true) ||
        stateData.ruleProtocol === "all"
        ? ""
        : stateData.ruleProtocol === "icmp"
          ? `Enter a whole number between 0 and ${max ? "255" : "254"}`
          : "Enter a whole number between 1 and 65535";
    },
  };
}

/**
 * init store
 * @param {*} store
 */
function initClassicSecurityGroups(store) {
  store.newField("classic_security_groups", {
    init: function (config) {
      config.store.json.classic_security_groups = [];
    },
    onStoreUpdate: function (config) {
      if (config.store.json.classic_security_groups) {
        config.store.json.classic_security_groups.forEach((sg) => {
          sg.classic_sg_rules.forEach((rule) => {
            rule.classic_sg = sg.name;
          });
        });
      } else {
        config.store.json.classic_security_groups = [];
      }
    },
    create: function (config, stateData, componentProps) {
      stateData.classic_sg_rules = [];
      config.push(["json", "classic_security_groups"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "classic_security_groups"],
        componentProps.data.name,
        stateData,
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(
        ["json", "classic_security_groups"],
        componentProps.data.name,
      );
    },
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "description"],
      "classic_security_groups",
    ),
    schema: {
      name: nameField("classic_security_groups"),
      description: {
        size: "wide",
        default: "",
        optional: true,
        invalid: function (stateData) {
          return invalidDescription(stateData.description);
        },
        invalidText: unconditionalInvalidText(
          "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/.",
        ),
        placeholder: "(Optional) Description",
      },
    },
    subComponents: {
      classic_sg_rules: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "classic_security_groups",
            "classic_sg_rules",
            stateData,
            componentProps,
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "classic_security_groups",
            "classic_sg_rules",
            stateData,
            componentProps,
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(
            config,
            "classic_security_groups",
            "classic_sg_rules",
            componentProps,
          );
        },
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "direction",
            "ruleProtocol",
            "port_range_min",
            "port_range_max",
          ],
          "classic_security_groups",
          "classic_sg_rules",
        ),
        schema: {
          name: nameField("classic_sg_rules"),
          direction: {
            type: "select",
            groups: ["Inbound", "Outbound"],
            onRender: titleCaseRender("direction"),
            onInputChange: kebabCaseInput("direction"),
            invalid: fieldIsNullOrEmptyString("direction"),
            invalidText: selectInvalidText("direction"),
          },
          ruleProtocol: {
            type: "select",
            default: "all",
            groups: ["All", "ICMP", "TCP", "UDP"],
            onInputChange: function (stateData) {
              stateData.port_range_min = null;
              stateData.port_range_max = null;
              return (stateData.ruleProtocol || "").toLowerCase();
            },
            onRender: function (stateData) {
              return isNullOrEmptyString(stateData.ruleProtocol, true)
                ? ""
                : stateData.ruleProtocol === "all"
                  ? "All"
                  : stateData.ruleProtocol.toUpperCase();
            },
          },
          port_range_min: portRangeField(),
          port_range_max: portRangeField(true),
        },
      },
    },
  });
}

module.exports = {
  initClassicSecurityGroups,
};
