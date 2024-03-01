const { isEmpty, splat } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
  resourceGroupsField,
} = require("../utils");
const { nameField } = require("../reusable-fields");

function powerVsWorkspaceSchema() {
  return {
    use_data: {
      type: "toggle",
      labelText: "Use Existing Workspace",
      default: false,
    },
    name: nameField("power", {
      /**
       * return helper text for power workspace
       * @param {*} stateData
       * @param {*} componentProps
       * @returns {string} helper text
       */
      helperText: function powerVsWorkspaceHelperText(
        stateData,
        componentProps
      ) {
        return stateData.use_data
          ? stateData.name
          : `${componentProps.craig.store.json._options.prefix}-power-workspace-${stateData.name}`;
      },
    }),
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
          `/api/power/${stateData.zone}/images` +
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
