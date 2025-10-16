const {
  splatContains,
  distinct,
  getObjectFromArray,
  deleteUnfoundArrayItems,
  isWholeNumber,
  isInRange,
  rangeInvalid,
  isEmpty,
  snakeCase,
  isNullOrEmptyString,
  titleCase,
  splat,
  contains,
} = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  resourceGroupsField,
  selectInvalidText,
  vpcGroups,
  securityGroupsMultiselect,
  unconditionalInvalidText,
  titleCaseRender,
} = require("./utils");
const { nameField } = require("./reusable-fields");

/**
 * initialize loadBalancer
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function loadBalancerInit(config) {
  config.store.json.load_balancers = [];
}

/**
 * on store update loadBalancer
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<Object>} config.store.json.load_balancer load balancers
 * @param {Array<Object>} config.store.json.vsi list of vsi
 * @param {Array<Object>} config.store.json.vpc list of vpc
 * @param {Object} config.store.subnets map of subnets
 * @param {Object} config.store.securityGroups map of security groups
 */
function loadBalancerOnStoreUpdate(config) {
  config.store.json.load_balancers.forEach((lb) => {
    if (lb.proxy_protocol === "") {
      lb.proxy_protocol = null;
    }
    let targetVsi = []; // store for new vsi
    let lbSubnets = []; // store for vsi subnets
    // remove unfound deployments and subnets
    lb.target_vsi.forEach((deployment) => {
      // if vsi exists
      if (splatContains(config.store.json.vsi, "name", deployment)) {
        targetVsi.push(deployment); // add vsi
        lbSubnets = distinct(
          // set load balancer subnets to list of distinct names of subnets from
          // each vsi deployment
          lbSubnets.concat(
            getObjectFromArray(config.store.json.vsi, "name", deployment)
              .subnets,
          ),
        );
      }
    });
    // set vsi and subnets
    lb.target_vsi = targetVsi;
    lb.subnets = lbSubnets;
    let vpcExists = splatContains(config.store.json.vpcs, "name", lb.vpc);
    if (vpcExists) {
      lb.subnets = deleteUnfoundArrayItems(
        config.store.subnets[lb.vpc],
        lb.subnets,
      );
    } else {
      lb.vpc = null;
      lb.subnets = [];
    }
    lb.security_groups = deleteUnfoundArrayItems(
      config.store.securityGroups[lb.vpc] === undefined // if there are no security groups for this vpc, looking up will result in undefined
        ? []
        : config.store.securityGroups[lb.vpc],
      lb.security_groups,
    );
    config.updateUnfoundResourceGroup(lb);
  });
}

/**
 * handle create loadBalancer object in store
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<Object>} config.store.json.load_balancer load balancers
 * @param {Object} stateData loadBalancer state data
 */
function loadBalancerCreate(config, stateData) {
  config.push(["json", "load_balancers"], stateData);
}

/**
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<Object>} config.store.json.load_balancer load balancers
 * @param {Object} stateData loadBalancer state data
 * @param {Object} componentProps loadBalancer form props
 * @param {Object} componentProps.data data object
 * @param {string} componentProps.data.name load balancer name
 */
function loadBalancerSave(config, stateData, componentProps) {
  config.updateChild(
    ["json", "load_balancers"],
    componentProps.data.name,
    stateData,
  );
}

/**
 * handle delete loadBalancer object from store
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {Array<Object>} config.store.json.load_balancer load balancers
 * @param {Object} stateData loadBalancer state data
 * @param {Object} componentProps loadBalancer form props
 * @param {Object} componentProps.data data object
 * @param {string} componentProps.data.name load balancer name
 */
function loadBalancerDelete(config, stateData, componentProps) {
  config.carve(["json", "load_balancers"], componentProps.data.name);
}

/**
 * disable a value in load baalancer within a range
 * @param {*} field field name
 * @param {number} min
 * @param {number} max
 * @returns {Function} function will evaluate to true if should be disabled
 */
function disableLoadBalancerSaveRangeValue(field, min, max) {
  return function (stateData, componentProps) {
    return (
      fieldIsNullOrEmptyString(field)(stateData, componentProps) ||
      !isWholeNumber(Number(stateData[field])) ||
      !isInRange(Number(stateData[field]), min, max)
    );
  };
}

/**
 * shortcut for upper case
 * @param {string} field
 * @returns {Function} on render function
 */
function renderUpperCase(field) {
  return function (stateData) {
    return (stateData[field] || "").toUpperCase();
  };
}

/**
 * shortcut for lower case
 * @param {string} field
 * @returns {Function} on render function
 */
function inputChangeLowerCase(field) {
  return function (stateData) {
    return (stateData[field] || "").toLowerCase();
  };
}

/**
 * initialize load balancer
 * @param {*} config
 */
function initLoadBalancers(store) {
  store.newField("load_balancers", {
    init: loadBalancerInit,
    onStoreUpdate: loadBalancerOnStoreUpdate,
    create: loadBalancerCreate,
    save: loadBalancerSave,
    delete: loadBalancerDelete,
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "resource_group",
        "type",
        "vpc",
        "security_groups",
        "target_vsi",
        "algorithm",
        "protocol",
        "listener_protocol",
        "listener_port",
        "health_retries",
        "health_timeout",
        "connection_limit",
        "health_delay",
        "port",
      ],
      "load_balancers",
    ),
    schema: {
      name: nameField("load_balancers", {
        size: "small",
        tooltip: {
          content:
            "Name for the load balancer service. This name will be prepended to the components provisioned as part of the load balancer.",
          align: "right",
        },
      }),
      resource_group: resourceGroupsField(true),
      type: {
        size: "small",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("type"),
        invalidText: selectInvalidText("load balancer type"),
        groups: ["Private (NLB)", "Public (ALB)"],
        onRender: function (stateData) {
          if (stateData.type === "public") {
            return "Public (ALB)";
          } else if (stateData.type === "private") {
            return "Private (NLB)";
          } else return "";
        },
        onInputChange: function (stateData) {
          return snakeCase(stateData.type.replace(/\s.+/g, ""));
        },
      },
      vpc: {
        type: "select",
        labelText: "VPC",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
        invalidText: selectInvalidText("VPC"),
        groups: vpcGroups,
        onStateChange: function (stateData, componentProps, targetData) {
          stateData.subnets = [];
          stateData.security_groups = [];
          stateData.vpc = targetData;
        },
      },
      security_groups: securityGroupsMultiselect(),
      target_vsi: {
        labelText: "Deployment VSI",
        size: "small",
        type: "multiselect",
        default: [],
        invalid: function (stateData) {
          return isEmpty(stateData?.target_vsi);
        },
        invalidText: unconditionalInvalidText(
          "select at least one VSI deployment",
        ),
        groups: function (stateData, componentProps) {
          if (isNullOrEmptyString(stateData.vpc, true)) {
            return [];
          } else {
            return splat(
              componentProps.craig.store.json.vsi.filter((instance) => {
                if (instance.vpc === stateData.vpc) {
                  return instance;
                }
              }),
              "name",
            );
          }
        },
        onStateChange: function (stateData, componentProps, targetData) {
          stateData.subnets = [];
          targetData.forEach((deployment) => {
            stateData.subnets = distinct(
              stateData.subnets.concat(
                getObjectFromArray(
                  componentProps.craig.store.json.vsi,
                  "name",
                  deployment,
                ).subnets,
              ),
            );
          });
          stateData.target_vsi = targetData;
        },
      },
      algorithm: {
        size: "small",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("algorithm"),
        invalidText: unconditionalInvalidText("Select an algorithm"),
        labelText: "Load Balancing Algorithm",
        groups: ["Round Robin", "Weighted Round Robin", "Least Connections"],
        onRender: titleCaseRender("algorithm"),
        onInputChange: function (stateData) {
          return snakeCase(stateData.algorithm);
        },
      },
      protocol: {
        type: "select",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("protocol"),
        invalidText: selectInvalidText("pool protocol"),
        labelText: "Pool Protocol",
        groups: ["HTTPS", "HTTP", "TCP", "UDP"],
        onRender: renderUpperCase("protocol"),
        onInputChange: inputChangeLowerCase("protocol"),
        tooltip: {
          content: "Protocol of the application running on VSI instances",
        },
      },
      health_type: {
        type: "select",
        size: "small",
        default: "",
        invalid: fieldIsNullOrEmptyString("health_type"),
        invalidText: selectInvalidText("health type"),
        groups: ["HTTPS", "HTTP", "TCP"],
        onRender: renderUpperCase("health_type"),
        onInputChange: inputChangeLowerCase("health_type"),
        tooltip: {
          content: "Protocol used to check the health of member VSI instances",
        },
        labelText: "Pool Health Protocol",
      },
      health_timeout: {
        size: "small",
        labelText: "Health Timeout (Seconds)",
        placeholder: "5",
        default: "",
        invalid: disableLoadBalancerSaveRangeValue("health_timeout", 5, 3000),
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 5 and 3000",
        ),
      },
      health_delay: {
        placeholder: "5",
        size: "small",
        labelText: "Health Delay (Seconds)",
        default: "",
        invalid: function (stateData, componentProps) {
          return (
            fieldIsNullOrEmptyString("health_delay")(
              stateData,
              componentProps,
            ) ||
            !isWholeNumber(Number(stateData.health_delay)) ||
            !isInRange(Number(stateData.health_delay), 5, 3000) ||
            stateData.health_delay <= stateData.health_timeout
          );
        },
        invalidText: function (stateData) {
          return stateData.health_delay <= stateData.health_timeout
            ? "Must be greater than Health Timeout value"
            : "Must be a whole number between 5 and 3000";
        },
      },
      health_retries: {
        size: "small",
        placeholder: "5",
        default: "",
        invalid: disableLoadBalancerSaveRangeValue("health_retries", 5, 3000),
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 5 and 3000",
        ),
      },
      listener_port: {
        size: "small",
        placeholder: "443",
        default: "",
        invalid: disableLoadBalancerSaveRangeValue("listener_port", 1, 65535),
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 1 and 65535",
        ),
      },
      listener_protocol: {
        size: "small",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("listener_protocol"),
        invalidText: selectInvalidText("listener protocol"),
        groups: ["HTTPS", "HTTP", "TCP", "UDP"],
        onRender: renderUpperCase("listener_protocol"),
        onInputChange: inputChangeLowerCase("listener_protocol"),
        tooltip: {
          content: "Protocol of the listener for the load balancer",
        },
      },
      connection_limit: {
        optional: true,
        size: "small",
        placeholder: "(Optional) 2",
        default: "",
        invalid: function (stateData) {
          return (
            !isNullOrEmptyString(stateData.connection_limit, true) &&
            rangeInvalid(Number(stateData.connection_limit), 1, 15000)
          );
        },
        invalidText: unconditionalInvalidText(
          "Must be a whole number between 1 and 15000",
        ),
      },
      proxy_protocol: {
        size: "small",
        type: "select",
        default: "disabled",
        groups: ["Disabled", "V1", "V2"],
        onInputChange: inputChangeLowerCase("proxy_protocol"),
        onRender: function (stateData) {
          return contains(["disabled", ""], stateData.proxy_protocol)
            ? "Disabled"
            : stateData.proxy_protocol.toUpperCase();
        },
      },
      session_persistence_type: {
        size: "small",
        type: "select",
        default: "",
        invalid: function () {
          return false;
        },
        groups: ["Source IP", "App Cookie", "HTTP Cookie"],
        onRender: function (stateData) {
          return stateData.session_persistence_type === "source_ip"
            ? "Source IP"
            : stateData.session_persistence_type === "http_cookie"
              ? "HTTP Cookie"
              : titleCase(stateData.session_persistence_type);
        },
        onInputChange: function (stateData) {
          return snakeCase(stateData.session_persistence_type.toLowerCase());
        },
      },
      session_persistence_app_cookie_name: {
        size: "small",
        default: "",
        hideWhen: function (stateData) {
          return stateData.session_persistence_type !== "app_cookie";
        },
        labelText: "Session Cookie Name",
      },
      port: {
        labelText: "Application Port",
        placeholder: "80",
        size: "small",
        default: "",
        invalid: disableLoadBalancerSaveRangeValue("port", 1, 65535),
        invalidText: unconditionalInvalidText(
          "Enter a whole number between 1 and 65535",
        ),
      },
    },
  });
}

module.exports = {
  loadBalancerInit,
  loadBalancerOnStoreUpdate,
  loadBalancerCreate,
  loadBalancerSave,
  loadBalancerDelete,
  initLoadBalancers,
};
