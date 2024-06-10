const { splat, contains, revision } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  invalidIpv4Address,
  invalidIpv4AddressText,
} = require("../utils");
const { nameField } = require("../reusable-fields");

function greTunnelSchema() {
  return {
    name: nameField("gre_tunnels"),
    zone: {
      labelText: "VPC Zone",
      type: "select",
      default: "",
      invalid: fieldIsNullOrEmptyString("zone"),
      invalidText: selectInvalidText("zone"),
      groups: ["1", "2", "3"],
      tooltip: {
        content: "Availability Zone where the tunnel will be connected",
        alignModal: "bottom-left",
      },
    },
    local_tunnel_ip: {
      default: "",
      labelText: "Local Tunnel IP",
      placeholder: "X.X.X.X",
      invalid: invalidIpv4Address("local_tunnel_ip"),
      invalidText: invalidIpv4AddressText,
    },
    remote_tunnel_ip: {
      default: "",
      labelText: "Remote Tunnel IP",
      placeholder: "X.X.X.X",
      invalid: invalidIpv4Address("remote_tunnel_ip"),
      invalidText: invalidIpv4AddressText,
    },
    local_gateway_ip: {
      default: "",
      labelText: "Local Gateway IP",
      placeholder: "X.X.X.X",
      invalid: invalidIpv4Address("local_gateway_ip"),
      invalidText: invalidIpv4AddressText,
    },
    remote_gateway_ip: {
      default: "",
      labelText: "Remote Gateway IP",
      placeholder: "X.X.X.X",
      invalid: invalidIpv4Address("remote_gateway_ip"),
      invalidText: invalidIpv4AddressText,
    },
    remote_bgp_asn: {
      default: "",
      labelText: "Remote BGP ASN",
      placeholder: "12345",
      tooltip: {
        content:
          "The remote network BGP ASN. If not added, one will be assigned automatically.",
      },
    },
  };
}

module.exports = { greTunnelSchema };
