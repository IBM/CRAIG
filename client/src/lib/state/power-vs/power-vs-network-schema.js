const { contains, isIpv4CidrOrAddress, isString } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
  selectInvalidText,
  hideWhenUseData,
} = require("../utils");
const {
  invalidName,
  invalidNameText,
  invalidCidrBlock,
  invalidCidrText,
} = require("../../forms");

function powerVsNetworkSchema() {
  return {
    use_data: {
      default: false,
      labelText: "Use Existing Subnet",
      type: "toggle",
      hideWhen: function (stateData) {
        return stateData.workspace_use_data !== true;
      },
    },
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
      hideWhen: hideWhenUseData,
    },
    pi_cidr: {
      // need to open an issue to add some sort of dynamic rendering to
      // inform the user that when use_data is true the CIDR listed here
      // is used only for reminder text
      default: "",
      placeholder: "X.X.X.X/X",
      labelText: "Network CIDR Block",
      invalid: function (stateData) {
        return stateData.use_data ? false : invalidCidrBlock(stateData.pi_cidr);
      },
      invalidText: function (stateData, componentProps) {
        return invalidCidrText(componentProps.craig)(stateData, componentProps);
      },
    },
    pi_dns: {
      labelText: "DNS Server IP",
      placeholder: "127.0.0.1",
      default: "",
      invalid: function (stateData) {
        return stateData.use_data
          ? false
          : isString(stateData?.pi_dns) || !stateData.pi_dns
          ? true
          : contains(stateData.pi_dns[0], "/") ||
            !isIpv4CidrOrAddress(stateData.pi_dns[0]);
      },
      invalidText: unconditionalInvalidText("Invalid IP Address"),
      onInputChange: function (stateData, targetData) {
        return [targetData];
      },
      onRender: function (stateData) {
        return stateData?.pi_dns ? stateData.pi_dns[0] : "";
      },
      helperText: function () {
        return null;
      },
      hideWhen: hideWhenUseData,
    },
    pi_network_mtu: {
      type: "toggle",
      default: false,
      labelText: "MTU Jumbo",
      hideWhen: hideWhenUseData,
    },
  };
}

module.exports = {
  powerVsNetworkSchema,
};
