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
    use_data: {
      type: "toggle",
      labelText: "Use Existing Workspace",
      default: false,
    },
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
      invalid: fieldIsNullOrEmptyString("zone", true),
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
      labelText: "Image Names",
      type: "fetchMultiSelect",
      default: "",
      invalid: function (stateData) {
        // prevent needing to add images when getting from data
        return stateData.use_data ? false : isEmpty(stateData.imageNames || []);
      },
      invalidText: unconditionalInvalidText("Select at least one image name"),
      groups: function (stateData) {
        return splat(stateData.images || [], "name");
      },
      apiEndpoint: function (stateData, componentProps) {
        return (
          `/api/power/${componentProps.craig.store.json._options.region}/images` +
          // add name query when using data to fetch images
          (stateData.use_data ? "?name=" + stateData.name : "")
        );
      },
      forceUpdateKey: function (stateData) {
        return JSON.stringify(stateData.images) + stateData.zone;
      },
    },
  };
}

module.exports = { powerVsWorkspaceSchema };
