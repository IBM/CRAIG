const { splat, isEmpty } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
} = require("../utils");
const { nameField } = require("../reusable-fields");

function powerVsCloudConnectionsSchema() {
  return {
    name: nameField("cloud_connections"),
    pi_cloud_connection_speed: {
      default: "",
      type: "select",
      invalid: fieldIsNullOrEmptyString("pi_cloud_connection_speed"),
      invalidText: unconditionalInvalidText("Select a connection speed"),
      labelText: "Connection Speed",
      groups: ["50", "100", "200", "500", "1000", "2000", "5000", "10000"],
    },
    pi_cloud_connection_global_routing: {
      type: "toggle",
      default: false,
      labelText: "Enable Global Routing",
    },
    pi_cloud_connection_metered: {
      type: "toggle",
      default: false,
      labelText: "Enable Metered Connection",
    },
    pi_cloud_connection_transit_enabled: {
      type: "toggle",
      default: false,
      labelText: "Enable Transit Gateway",
    },
    transit_gateways: {
      type: "multiselect",
      hideWhen: function (stateData) {
        return stateData.pi_cloud_connection_transit_enabled !== true;
      },
      default: [],
      invalid: function (stateData) {
        return (
          stateData.pi_cloud_connection_transit_enabled &&
          isEmpty(stateData.transit_gateways)
        );
      },
      invalidText: unconditionalInvalidText(
        "Select at least one transit gateway"
      ),
      groups: function (stateData, componentProps) {
        return splat(componentProps.craig.store.json.transit_gateways, "name");
      },
    },
  };
}

module.exports = {
  powerVsCloudConnectionsSchema,
};
