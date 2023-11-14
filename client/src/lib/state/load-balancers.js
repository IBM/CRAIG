const {
  splatContains,
  distinct,
  getObjectFromArray,
  deleteUnfoundArrayItems,
  isWholeNumber,
  isInRange,
  rangeInvalid,
  isEmpty,
} = require("lazy-z");
const { invalidNameText, invalidName } = require("../forms");
const { fieldIsNullOrEmptyString } = require("./utils");

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
              .subnets
          )
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
        lb.subnets
      );
    } else {
      lb.vpc = null;
      lb.subnets = [];
    }
    lb.security_groups = deleteUnfoundArrayItems(
      config.store.securityGroups[lb.vpc] === undefined // if there are no security groups for this vpc, looking up will result in undefined
        ? []
        : config.store.securityGroups[lb.vpc],
      lb.security_groups
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
    stateData
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

function loadBalancerShouldDisableSave(config, stateData, componentProps) {
  let shouldBeDisabled = false;
  [
    "name",
    "resource_group",
    "type",
    "vpc",
    "security_groups",
    "target_vsi",
    "algorithm",
    "pool_protocol",
    "pool_health_protocol",
    "listener_protocol",
    "listener_port",
    "health_retries",
    "health_timeout",
    "connection_limit",
    "health_delay",
    "port",
  ].forEach((field) => {
    if (!shouldBeDisabled) {
      shouldBeDisabled = config.load_balancers[field].invalid(
        stateData,
        componentProps
      );
    }
  });
  return shouldBeDisabled;
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
      !isWholeNumber(stateData[field]) ||
      !isInRange(stateData[field], min, max)
    );
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
    shouldDisableSave: loadBalancerShouldDisableSave,
    schema: {
      name: {
        default: "",
        invalid: invalidName("load_balancers"),
        invalidText: invalidNameText("load_balancers"),
      },
      resource_group: {
        default: "",
        invalid: fieldIsNullOrEmptyString("resource_groups"),
      },
      type: {
        default: "",
        invalid: fieldIsNullOrEmptyString("type"),
      },
      vpc: {
        default: "",
        invalid: fieldIsNullOrEmptyString("vpc"),
      },
      security_groups: {
        default: "",
        invalid: function (stateData) {
          return isEmpty(stateData.security_groups);
        },
      },
      target_vsi: {
        default: "",
        invalid: function (stateData) {
          return isEmpty(stateData.target_vsi);
        },
      },
      algorithm: {
        default: "",
        invalid: fieldIsNullOrEmptyString("algorithm"),
      },
      pool_protocol: {
        default: "",
        invalid: fieldIsNullOrEmptyString("pool_protocol"),
      },
      pool_health_protocol: {
        default: "",
        invalid: fieldIsNullOrEmptyString("pool_health_protocol"),
      },
      listener_protocol: {
        default: "",
        invalid: fieldIsNullOrEmptyString("listener_protocol"),
      },
      listener_port: {
        default: "",
        invalid: disableLoadBalancerSaveRangeValue("listener_port", 1, 65535),
      },
      connection_limit: {
        default: null,
        invalid: function (stateData) {
          return (
            stateData.connection_limit &&
            rangeInvalid(stateData.connection_limit, 1, 15000)
          );
        },
      },
      health_retries: {
        default: "",
        invalid: function (stateData, componentProps) {
          return (
            fieldIsNullOrEmptyString("health_retries")(
              stateData,
              componentProps
            ) ||
            !isWholeNumber(stateData.health_retries) ||
            !isInRange(stateData.health_retries, 5, 3000)
          );
        },
      },
      health_timeout: {
        default: "",
        invalid: function (stateData, componentProps) {
          return (
            fieldIsNullOrEmptyString("health_timeout")(
              stateData,
              componentProps
            ) ||
            !isWholeNumber(stateData.health_timeout) ||
            !isInRange(stateData.health_timeout, 5, 3000) ||
            stateData.health_delay <= stateData.health_timeout
          );
        },
      },
      health_delay: {
        default: "",
        invalid: function (stateData, componentProps) {
          return (
            fieldIsNullOrEmptyString("health_delay")(
              stateData,
              componentProps
            ) ||
            !isWholeNumber(stateData.health_delay) ||
            !isInRange(stateData.health_delay, 5, 3000) ||
            stateData.health_delay <= stateData.health_timeout
          );
        },
      },
      port: {
        default: "",
        invalid: disableLoadBalancerSaveRangeValue("port", 1, 65535),
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
