const { splat, contains, revision } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  invalidIpv4Address,
  invalidIpv4AddressText,
} = require("../utils");

function greTunnelSchema() {
  return {
    gateway: {
      type: "select",
      default: "",
      invalid: fieldIsNullOrEmptyString("gateway"),
      invalidText: selectInvalidText("gateway"),
      groups: function (stateData, componentProps) {
        let allGws = splat(
          componentProps.craig.store.json.classic_gateways,
          "name"
        );
        let tgwType = new revision(componentProps.craig.store.json).child(
          "transit_gateways",
          componentProps.arrayParentName
        ).data.global;
        let matchingConnections = [];
        componentProps.craig.store.json.transit_gateways.forEach((gw) => {
          if (gw.global === tgwType) {
            gw.gre_tunnels.forEach((tunnel) => {
              matchingConnections.push(tunnel.gateway);
            });
          }
        });
        return allGws
          .filter((gw) => {
            if (!contains(matchingConnections, gw)) {
              return gw;
            }
          })
          .concat(
            componentProps.data?.gateway ? [componentProps.data.gateway] : []
          );
      },
    },
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
