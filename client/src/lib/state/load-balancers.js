const {
  splatContains,
  revision,
  carve,
  distinct,
  getObjectFromArray
} = require("lazy-z");
const { pushAndUpdate } = require("./store.utils");
const { deleteUnfoundArrayItems } = require("./utils");

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
  config.store.json.load_balancers.forEach(lb => {
    let targetVsi = []; // store for new vsi
    let lbSubnets = []; // store for vsi subnets
    // remove unfound deployments and subnets
    lb.target_vsi.forEach(deployment => {
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
  pushAndUpdate(config, "load_balancers", stateData);
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
  new revision(config.store.json).updateChild(
    "load_balancers",
    componentProps.data.name,
    "name",
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
  carve(config.store.json.load_balancers, "name", componentProps.data.name);
}

module.exports = {
  loadBalancerInit,
  loadBalancerOnStoreUpdate,
  loadBalancerCreate,
  loadBalancerSave,
  loadBalancerDelete
};
