const {
  deleteUnfoundArrayItems,
  isNullOrEmptyString,
  rangeInvalid,
  isEmpty,
  titleCase,
  snakeCase,
  contains,
  splat,
  isString,
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  invalidName,
  invalidNameText,
  invalidCidrBlock,
  invalidCrnList,
  invalidCrnText,
} = require("../forms");
const {
  fieldIsNullOrEmptyString,
  resourceGroupsField,
  selectInvalidText,
  vpcGroups,
  subnetMultiSelect,
  unconditionalInvalidText,
  securityGroupsMultiselect,
  fieldIsNotWholeNumber,
  titleCaseRender,
  kebabCaseInput,
  shouldDisableComponentSave,
} = require("./utils");
const {
  commaSeparatedIpListExp,
  commaSeparatedCidrListExp,
} = require("../constants");

/**
 * initialize vpn servers in store
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 */
function vpnServerInit(config) {
  config.store.json.vpn_servers = [];
}

function vpnServerOnStoreUpdate(config) {
  config.store.json.vpn_servers.forEach((server) => {
    config.setUnfound("resourceGroups", server, "resource_group");
    if (!server.additional_prefixes) {
      server.additional_prefixes = [];
    }
    // update vpc
    if (hasUnfoundVpc(config, server)) {
      server.vpc = null;
      server.subnets = [];
      server.security_groups = [];
    } else {
      // otherwise check for valid subnets
      let vpcSubnets = config.store.subnets[server.vpc];
      // delete cluster subnets
      server.subnets = deleteUnfoundArrayItems(vpcSubnets, server.subnets);
      // and check for valid security groups
      let vpcSgs = config.store.securityGroups[server.vpc];
      server.security_groups = deleteUnfoundArrayItems(
        vpcSgs,
        server.security_groups
      );
    }
    if (isString(server.protocol)) {
      server.protocol = server.protocol.toLowerCase();
    }
  });
}

/**
 * save vpn servers
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {object} stateData component state data
 */
function vpnServerSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "vpn_servers"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new vpn server
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function vpnServerCreate(config, stateData) {
  stateData.routes = [];
  config.push(["json", "vpn_servers"], stateData);
}

/**
 * delete vpn server
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function vpnServerDelete(config, stateData, componentProps) {
  config.carve(["json", "vpn_servers"], componentProps.data.name);
}

/**
 * create new vpn server route
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {Array<string>} config.store.json.vpn_servers.routes
 * @param {object} stateData component state data
 */
function vpnServerRouteCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "vpn_servers",
    "routes",
    stateData,
    componentProps
  );
}

/**
 * update vpn server route
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {Array<string>} config.store.json.vpn_servers.routes
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function vpnServerRouteSave(config, stateData, componentProps) {
  updateSubChild(config, "vpn_servers", "routes", stateData, componentProps);
}

/**
 * delete a vpn server route
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vpn_servers
 * @param {Array<string>} config.store.json.vpn_servers.routes
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function vpnServerRouteDelete(config, stateData, componentProps) {
  deleteSubChild(config, "vpn_servers", "routes", componentProps);
}

/**
 * hide when insecure
 * @param {*} stateData
 * @returns {boolean} true if hidden
 */
function hideWhenByoOrInsecure(stateData) {
  return contains(["byo", "INSECURE"], stateData.method);
}

/**
 * initialize vpn state
 * @param {lazyZstate} store
 */
function initVpnState(store) {
  store.newField("vpn_servers", {
    init: vpnServerInit,
    onStoreUpdate: vpnServerOnStoreUpdate,
    create: vpnServerCreate,
    save: vpnServerSave,
    delete: vpnServerDelete,
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "resource_group",
        "vpc",
        "security_groups",
        "client_ip_pool",
        "port",
        "client_idle_timeout",
        "certificate_crn",
        "client_dns_server_ips",
        "subnets",
        "additional_prefixes",
        "zone",
        "secrets_manager",
      ],
      "vpn_servers"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("vpn_servers"),
        invalidText: invalidNameText("vpn_servers"),
        size: "small",
        /**
         * return helper text for vpn servers
         * @param {*} stateData
         * @param {*} componentProps
         * @returns {string} helper text
         */
        helperText: function vpnServersHelperText(stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-vpn-server-${stateData.name}`;
        },
      },
      resource_group: resourceGroupsField(true),
      vpc: {
        default: "",
        labelText: "VPC",
        invalid: fieldIsNullOrEmptyString("vpc"),
        invalidText: selectInvalidText("VPC"),
        type: "select",
        size: "small",
        groups: vpcGroups,
        onInputChange: function (stateData) {
          stateData.subnets = [];
          stateData.security_groups = [];
          return stateData.vpc;
        },
      },
      subnets: subnetMultiSelect({}),
      security_groups: securityGroupsMultiselect(),
      method: {
        size: "small",
        type: "select",
        default: "",
        labelText: "Authentication Method",
        invalid: fieldIsNullOrEmptyString("method"),
        invalidText: unconditionalInvalidText(
          "Select an authentication method"
        ),
        groups: [
          "Certificate",
          "Username",
          "Bring Your Own Certificate",
          "INSECURE - Developer Certificate",
        ],
        onRender(stateData) {
          return stateData.method === "INSECURE"
            ? "INSECURE - Developer Certificate"
            : stateData.method === "byo"
            ? "Bring Your Own Certificate"
            : titleCase(stateData.method);
        },
        onInputChange(stateData) {
          return stateData.method === "INSECURE - Developer Certificate"
            ? "INSECURE"
            : stateData.method === "Bring Your Own Certificate"
            ? "byo"
            : snakeCase(stateData.method);
        },
      },
      certificate_crn: {
        size: "small",
        default: "",
        labelText: "Certificate CRN",
        tooltip: {
          content:
            "Secrets Manager certificate unique identifier for VPN server",
          align: "top-left",
        },
        invalid: function (stateData) {
          return contains(["byo", "INSECURE"], stateData.method)
            ? false
            : invalidCrnList([stateData.certificate_crn]);
        },
        invalidText: invalidCrnText,
        hideWhen: hideWhenByoOrInsecure,
      },
      client_ca_crn: {
        default: "",
        size: "small",
        labelText: "Client CA CRN",
        invalid: function (stateData) {
          return stateData.method === "certificate"
            ? invalidCrnList([stateData.client_ca_crn])
            : false;
        },
        invalidText: invalidCrnText,
        tooltip: {
          content: "Client Secrets Manager Certificate CRN",
          align: "top-left",
        },
        hideWhen: hideWhenByoOrInsecure,
      },
      secrets_manager: {
        type: "select",
        size: "small",
        labelText: "Secrets Manager Instance",
        default: "",
        invalid: function (stateData) {
          return contains(["byo", "INSECURE"], stateData.method)
            ? isNullOrEmptyString(stateData.secrets_manager, true)
            : false;
        },
        invalidText: selectInvalidText("Secrets Manager instance"),
        hideWhen: function (stateData) {
          return (
            isNullOrEmptyString(stateData.method, true) ||
            !hideWhenByoOrInsecure(stateData)
          );
        },
        groups: function (stateData, componentProps) {
          return splat(componentProps.craig.store.json.secrets_manager, "name");
        },
      },
      client_ip_pool: {
        size: "small",
        labelText: "Client CIDR Pool",
        tooltip: {
          content:
            "VPN client IPv4 address pool, expressed in CIDR format. The request must not overlap with any existing address prefixes in the VPC or any reserved address ranges.",
          link: "https://cloud.ibm.com/docs/vpc?topic=vpc-vpn-client-to-site-overview",
          align: "top-left",
        },
        placeholder: "X.X.X.X/X",
        default: "",
        invalid: function (stateData, componentProps) {
          return (
            fieldIsNullOrEmptyString("client_ip_pool")(
              stateData,
              componentProps
            ) || invalidCidrBlock(stateData.client_ip_pool)
          );
        },
        invalidText: unconditionalInvalidText("Invalid CIDR block"),
      },
      port: {
        size: "small",
        default: "",
        invalid: fieldIsNotWholeNumber("port", 1, 65535),
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 1 and 65535"
        ),
      },
      protocol: {
        type: "select",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("protocol"),
        invalidText: selectInvalidText("protocol"),
        groups: ["TCP", "UDP"],
        onRender: function (stateData) {
          return (stateData.protocol || "").toUpperCase();
        },
        onInputChange: function (stateData) {
          return stateData.protocol.toLowerCase();
        },
      },
      enable_split_tunneling: {
        type: "toggle",
        size: "small",
        default: false,
        labelText: "Enable Split Tunneling",
      },
      client_idle_timeout: {
        labelText: "Client Idle Timeout (s)",
        size: "small",
        default: "",
        invalid: function (stateData) {
          return stateData.client_idle_timeout
            ? rangeInvalid(parseInt(stateData.client_idle_timeout), 0, 28800)
            : false;
        },
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 0 and 28800"
        ),
      },
      client_dns_server_ips: {
        labelText: "Client DNS Server IPs",
        type: "textArea",
        default: "",
        invalid: function (stateData) {
          return (
            !isNullOrEmptyString(stateData.client_dns_server_ips) &&
            (stateData.client_dns_server_ips || "").match(
              commaSeparatedIpListExp
            ) === null
          );
        },
        invalidText: unconditionalInvalidText(
          "Please enter a comma separated list of IP addresses."
        ),
        helperText: unconditionalInvalidText(
          "Enter a comma separated list of IP addresses."
        ),
        placeholder: "X.X.X.X, X.X.X.X, ...",
      },
      additional_prefixes: {
        type: "textArea",
        labelText: "Additonal Prefixes",
        default: [],
        invalid: function (stateData) {
          return (
            isNullOrEmptyString(stateData.additional_prefixes) ||
            stateData.additional_prefixes
              .join(",")
              .replace(/\s*/g, "")
              .match(commaSeparatedCidrListExp) === null
          );
        },
        placeholder: "X.X.X.X/X, X.X.X.X/X, ...",
        invalidText: unconditionalInvalidText(
          "Enter a list of comma separated CIDR blocks"
        ),
        onRender: function (stateData) {
          return stateData.additional_prefixes.join(",");
        },
        onInputChange: function (stateData) {
          return stateData.additional_prefixes.split(",");
        },
        invalidText: unconditionalInvalidText(
          "Please enter a comma separated list of IPV4 CIDR blocks."
        ),
        helperText: unconditionalInvalidText(
          "Enter a comma separated list of IPV4 CIDR blocks."
        ),
      },
      zone: {
        type: "select",
        size: "small",
        default: "",
        invalid: function (stateData) {
          return (
            !isEmpty(stateData.additional_prefixes) &&
            isNullOrEmptyString(stateData.zone)
          );
        },
        invalidText: selectInvalidText("zone"),
        groups: ["1", "2", "3"],
      },
    },
    subComponents: {
      routes: {
        create: vpnServerRouteCreate,
        save: vpnServerRouteSave,
        delete: vpnServerRouteDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "destination", "action"],
          "vpn_servers",
          "routes"
        ),
        schema: {
          name: {
            size: "small",
            default: "",
            invalid: invalidName("vpn_server_routes"),
            invalidText: invalidNameText("vpn_server_routes"),
          },
          destination: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              return invalidCidrBlock(stateData.destination);
            },
            invalidText: unconditionalInvalidText(
              "Destination must be a valid IPV4 CIDR Block"
            ),
          },
          action: {
            size: "small",
            type: "select",
            default: "",
            groups: ["Translate", "Deliver", "Drop"],
            onRender: titleCaseRender("action"),
            onInputChange: kebabCaseInput("action"),
            invalidText: unconditionalInvalidText("Select an action"),
          },
        },
      },
    },
  });
}

module.exports = {
  vpnServerInit,
  vpnServerOnStoreUpdate,
  vpnServerCreate,
  vpnServerSave,
  vpnServerDelete,
  vpnServerRouteCreate,
  vpnServerRouteSave,
  vpnServerRouteDelete,
  initVpnState,
};
