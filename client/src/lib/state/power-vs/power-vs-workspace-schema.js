const { isEmpty, isNullOrEmptyString, splat, distinct } = require("lazy-z");
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
          // while the power vs image dynamic fetch is not working we need to
          // manually add the VTL image for now. this is not ideal and should
          // be removed as soon as possible
          return distinct(
            splat(powerImages[stateData.zone], "name").concat(
              "VTL-FalconStor-10_03-001"
            )
          );
        }
      },
      forceUpdateKey: function (stateData) {
        return stateData.zone;
      },
    },
  };
}

module.exports = { powerVsWorkspaceSchema };
