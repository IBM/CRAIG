const { isEmpty, isNullOrEmptyString, splat } = require("lazy-z");
const powerImages = require("../../docs/power-image-map.json");
const {
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
  resourceGroupsField,
} = require("../utils");
const {
  invalidName,
  invalidNameText,
  powerVsWorkspaceHelperText,
} = require("../../forms");

function powerVsWorkspaceSchema() {
  return {
    name: {
      default: "",
      invalid: invalidName("power"),
      invalidText: invalidNameText("power"),
      helperText: powerVsWorkspaceHelperText,
    },
    resource_group: resourceGroupsField(),
    zone: {
      type: "select",
      default: "",
      labelText: "Availability Zone",
      invalid: fieldIsNullOrEmptyString("zone"),
      invalidText: unconditionalInvalidText("Select a zone"),
      onStateChange: function (stateData) {
        stateData.imageNames = [];
        stateData.images = [];
      },
      groups: function (stateData, componentProps) {
        return componentProps.craig.store.json._options.power_vs_zones;
      },
    },
    imageNames: {
      type: "multiselect",
      default: [],
      invalid: function (stateData) {
        return isEmpty(stateData.imageNames || []);
      },
      invalidText: unconditionalInvalidText("Select at least one image name"),
      groups: function (stateData) {
        if (isNullOrEmptyString(stateData.zone, true)) {
          return [];
        } else {
          return splat(powerImages[stateData.zone], "name");
        }
      },
      forceUpdateKey: function (stateData) {
        return stateData.zone;
      },
    },
  };
}

module.exports = { powerVsWorkspaceSchema };
