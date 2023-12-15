const {
  transpose,
  isIpv4CidrOrAddress,
  contains,
  isNullOrEmptyString,
  titleCase,
  snakeCase,
  buildNumberDropdownList,
} = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const {
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal,
  hasUnfoundVpc,
} = require("./store.utils");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  selectInvalidText,
  vpcGroups,
  unconditionalInvalidText,
} = require("./utils");
const { invalidNameText, invalidName } = require("../forms");

/**
 * initialize routing table in slz store
 * @param {lazyZstate} config
 */
function routingTableInit(config) {
  config.store.json.routing_tables = [];
}

/**
 * update routing table store
 * @param {lazyZstate} config
 */
function routingTableOnStoreUpdate(config) {
  config.store.json.routing_tables.forEach((table) => {
    if (hasUnfoundVpc(config, table)) {
      table.vpc = null;
      table.routes.forEach((route) => {
        route.vpc = null;
      });
    }
    table.routes.forEach((route) => {
      route.routing_table = table.name;
      route.vpc = table.vpc;
    });
  });
}

/**
 * save routing table
 * @param {object} stateData component state data
 */
function routingTableSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "routing_tables"],
    componentProps.data.name,
    stateData
  );
}

/**
 * create a new routing table
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function routingTableCreate(config, stateData) {
  let data = {
    routes: [],
  };
  transpose(stateData, data);
  config.push(["json", "routing_tables"], data);
}

/**
 * delete routing table
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableDelete(config, stateData, componentProps) {
  config.carve(["json", "routing_tables"], componentProps.data.name);
}
/**
 * create new routing table route
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function routingTableRouteCreate(config, stateData, componentProps) {
  pushToChildFieldModal(
    config,
    "routing_tables",
    "routes",
    stateData,
    componentProps
  );
}

/**
 * update routing table route
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableRouteSave(config, stateData, componentProps) {
  updateSubChild(config, "routing_tables", "routes", stateData, componentProps);
}

/**
 * delete a routing table route
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function routingTableRouteDelete(config, stateData, componentProps) {
  deleteSubChild(config, "routing_tables", "routes", componentProps);
}

function initRoutingTable(store) {
  store.newField("routing_tables", {
    init: routingTableInit,
    onStoreUpdate: routingTableOnStoreUpdate,
    create: routingTableCreate,
    save: routingTableSave,
    delete: routingTableDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "vpc"],
      "routing_tables"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("routing_tables"),
        invalidText: invalidNameText("routing_tables"),
      },
      vpc: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
        invalidText: selectInvalidText("VPC"),
        groups: vpcGroups,
        labelText: "VPC",
      },
      internet_ingress: {
        default: false,
        type: "toggle",
        labelText: "Internet Ingress",
        tooltip: {
          content:
            "If set to true, this routing table will be used to route traffic that originates from the internet. For this to succeed, the VPC must not already have a routing table with this property set to true",
          align: "bottom-left",
          alignModal: "bottom-left",
        },
      },
      route_direct_link_ingress: {
        default: false,
        type: "toggle",
        tooltip: {
          content:
            "If set to true, the routing table is used to route traffic that originates from Direct Link to the VPC. To succeed, the VPC must not already have a routing table with the property set to true",
          align: "bottom-left",
          alignModal: "bottom-left",
        },
        labelText: "Direct Link Ingress",
      },
      transit_gateway_ingress: {
        default: false,
        type: "toggle",
        labelText: "Transit Gateway Ingress",
        tooltip: {
          content:
            "If set to true, the routing table is used to route traffic that originates from Transit Gateway to the VPC. To succeed, the VPC must not already have a routing table with the property set to true",
          align: "bottom-left",
          alignModal: "bottom-left",
        },
      },
      route_vpc_zone_ingress: {
        default: false,
        type: "toggle",
        labelText: "VPC Zone Ingress",
        tooltip: {
          content:
            "If set to true, the routing table is used to route traffic that originates from subnets in other zones in the VPC. To succeed, the VPC must not already have a routing table with the property set to true",
          align: "bottom-left",
          alignModal: "bottom-left",
        },
      },
      accept_routes_from_resource_type: {
        default: [],
        type: "multiselect",
        labelText: "Additional Route Sources",
        groups: ["VPN Server", "VPN Gateway"],
        onRender: function (stateData) {
          return stateData.accept_routes_from_resource_type.map((type) => {
            return titleCase(type).replace(/Vpn/g, "VPN");
          });
        },
        onInputChange: function (stateData) {
          return stateData.accept_routes_from_resource_type.map((type) => {
            return snakeCase(type);
          });
        },
      },
    },
    subComponents: {
      routes: {
        create: routingTableRouteCreate,
        save: routingTableRouteSave,
        delete: routingTableRouteDelete,
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "zone", "action", "next_hop", "destination"],
          "routing_tables",
          "routes"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("routes"),
            invalidText: invalidNameText("routes"),
            size: "small",
          },
          zone: {
            default: "",
            invalid: fieldIsNullOrEmptyString("zone"),
            invalidText: selectInvalidText("zone"),
            groups: buildNumberDropdownList(3, 1),
            size: "small",
            type: "select",
          },
          action: {
            default: "",
            type: "select",

            invalid: fieldIsNullOrEmptyString("action"),
            invalidText: unconditionalInvalidText("Selet an action"),
            groups: ["Delegate", "Deliver", "Delegate VPC", "Drop"],
            onRender: function (stateData) {
              return titleCase(stateData.action || "").replace("Vpc", "VPC");
            },
            onInputChange: function (stateData) {
              return snakeCase(stateData.action);
            },
            size: "small",
          },
          next_hop: {
            default: "",
            invalid: function (stateData, componentProps) {
              return (
                stateData.action === "deliver" &&
                (isNullOrEmptyString(stateData.next_hop) ||
                  !isIpv4CidrOrAddress(stateData.next_hop) ||
                  contains(stateData.next_hop, "/"))
              );
            },
            invalidText: unconditionalInvalidText("Must be a valid IP address"),
            placeholder: "X.X.X.X",
            size: "small",
            hideWhen: function (stateData) {
              return stateData.action !== "deliver";
            },
          },
          destination: {
            default: "",
            invalid: function (stateData, componentProps) {
              return (
                isNullOrEmptyString(stateData.destination) ||
                !isIpv4CidrOrAddress(stateData.destination)
              );
            },
            invalidText: unconditionalInvalidText(
              "Enter a valid IPV4 address or CIDR block"
            ),
            placeholder: "X.X.X.X/X",
            size: "small",
          },
        },
      },
    },
  });
}

module.exports = {
  routingTableInit,
  routingTableOnStoreUpdate,
  routingTableCreate,
  routingTableSave,
  routingTableDelete,
  routingTableRouteCreate,
  routingTableRouteSave,
  routingTableRouteDelete,
  initRoutingTable,
};
