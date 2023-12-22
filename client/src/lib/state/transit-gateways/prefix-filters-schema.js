const {
  isNullOrEmptyString,
  revision,
  splat,
  isIpv4CidrOrAddress,
  contains,
} = require("lazy-z");
const { invalidName, invalidNameText } = require("../../forms");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  wholeNumberField,
  wholeNumberText,
  unconditionalInvalidText,
} = require("../utils");

function prefixFiltersSchema() {
  return {
    name: {
      default: "",
      invalid: invalidName("prefix_filters"),
      invalidText: invalidNameText("prefix_filters"),
    },
    connection_type: {
      type: "select",
      default: "",
      groups: ["VPC", "Power VS", "GRE Tunnel"],
      invalidText: selectInvalidText("Connection Type"),
      invalid: function (stateData) {
        return isNullOrEmptyString(stateData.connection_type);
      },
      onStateChange: function (stateData) {
        stateData.target = "";
      },
    },
    target: {
      type: "select",
      default: "",
      labelText: "Filter Target",
      groups: function (stateData, componentProps) {
        if (isNullOrEmptyString(stateData.connection_type)) return [];
        let parentTgw = new revision(componentProps.craig.store.json).child(
          "transit_gateways",
          componentProps.arrayParentName
        ).data;
        return stateData.connection_type === "VPC"
          ? splat(
              parentTgw.connections.filter((connection) => {
                if (connection.vpc) return connection;
              }),
              "vpc"
            )
          : stateData.connection_type === "Power VS"
          ? splat(
              parentTgw.connections.filter((connection) => {
                if (connection.power) return connection;
              }),
              "power"
            )
          : // else gre
            splat(parentTgw.gre_tunnels, "gateway");
      },
      invalid: fieldIsNullOrEmptyString("target"),
      invalidText: selectInvalidText("connection target"),
    },
    action: {
      type: "select",
      default: "",
      invalid: fieldIsNullOrEmptyString("action"),
      invalidText: unconditionalInvalidText("Select an action"),
      groups: ["Permit", "Deny"],
    },
    prefix: {
      default: "",
      placeholder: "X.X.X.X/X",
      invalid: function (stateData) {
        return (
          !isIpv4CidrOrAddress(stateData.prefix || "") ||
          !contains(stateData.prefix, "/")
        );
      },
      invalidText: unconditionalInvalidText("Enter a valid IPV4 CIDR Block"),
    },
    le: {
      default: "0",
      placeholder: "0",
      labelText: "Less Than or Equal To",
      tooltip: {
        content:
          "Value can be included to match all more-specific prefixes within a parent prefix above a certain length",
      },
      invalid: wholeNumberField("le"),
      invalidText: wholeNumberText,
    },
    ge: {
      default: "0",
      placeholder: "0",
      labelText: "Greater Than or Equal To",
      tooltip: {
        content:
          "Value can be included to match all less-specific prefixes within a parent prefix above a certain length",
      },
      invalid: wholeNumberField("ge"),
      invalidText: wholeNumberText,
    },
  };
}

module.exports = {
  prefixFiltersSchema,
};
