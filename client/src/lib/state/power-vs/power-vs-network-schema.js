const { contains, isIpv4CidrOrAddress, isString } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
  selectInvalidText,
} = require("../utils");
const {
  invalidName,
  invalidNameText,
  invalidCidrBlock,
  invalidCidrText,
} = require("../../forms");

function powerVsNetworkSchema() {
  return {
    name: {
      default: "",
      invalid: invalidName("network"),
      invalidText: invalidNameText("network"),
    },
    pi_network_type: {
      type: "select",
      default: "",
      labelText: "Network Type",
      invalid: fieldIsNullOrEmptyString("pi_network_type"),
      invalidText: selectInvalidText("network type"),
      groups: ["vlan", "pub-vlan"],
    },
    pi_cidr: {
      default: "",
      placeholder: "X.X.X.X/X",
      labelText: "Network CIDR Block",
      invalid: function (stateData) {
        return invalidCidrBlock(stateData.pi_cidr);
      },
      invalidText: function (stateData, componentProps) {
        return invalidCidrText(componentProps.craig)(stateData, componentProps);
      },
    },
    pi_dns: {
      labelText: "DNS Server IP",
      default: "",
      invalid: function (stateData) {
        return isString(stateData.pi_dns)
          ? true
          : contains(stateData.pi_dns[0], "/") ||
              !isIpv4CidrOrAddress(stateData.pi_dns[0]);
      },
      invalidText: unconditionalInvalidText("Invalid IP Address"),
      onInputChange: function (stateData, targetData) {
        return [targetData];
      },
      onRender: function (stateData) {
        return stateData.pi_dns[0];
      },
      helperText: function () {
        return null;
      },
    },
    pi_network_jumbo: {
      type: "toggle",
      default: false,
      labelText: "MTU Jumbo",
    },
  };
}

module.exports = {
  powerVsNetworkSchema,
};
