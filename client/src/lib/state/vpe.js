const { newDefaultVpe } = require("./defaults");
const {
  splatContains,
  eachKey,
  containsKeys,
  revision,
  contains,
  carve
} = require("lazy-z");
const { pushAndUpdate, updateChild } = require("./store.utils");
const { deleteUnfoundArrayItems } = require("./utils");

/**
 * initialize vpe
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function vpeInit(config) {
  config.store.json.virtual_private_endpoints = newDefaultVpe();
}

/**
 * on store update vpe
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function vpeOnStoreUpdate(config) {
  config.store.json.virtual_private_endpoints.forEach(vpe => {
    let vpcExists = splatContains(config.store.json.vpcs, "name", vpe.vpc);
    // if the vpc is in names
    if (vpcExists) {
      // delete unfound subnets and add to list
      vpe.subnets = deleteUnfoundArrayItems(
        config.store.subnets[vpe.vpc],
        vpe.subnets
      );
    } else {
      // set to null if does not exist
      vpe.vpc = null;
      vpe.subnets = [];
    }
    // if no security group set to null
    vpe.security_groups = deleteUnfoundArrayItems(
      config.store.securityGroups[vpe.vpc] === undefined // if there are no security groups for this vpc, looking up will result in undefined
        ? []
        : config.store.securityGroups[vpe.vpc],
      vpe.security_groups
    );
    config.updateUnfoundResourceGroup(vpe);
  });
}

/**
 * handle create vpe object in store
 * @param {Object} stateData vpe state data
 * @param {Object} stateData.vpe vpe object
 * @param {string} stateData.vpe.service name of vpe service
 * @param {string} stateData.vpe.vpc name of attached vpc
 * @param {string} stateData.vpe.resource_group resource group
 * @param {Array<string>} stateData.vpe.subnets list of subnets
 * @param {Array<string>} stateData.vpe.security_groups list of security groups
 * @param {Object} componentProps
 */
function vpeCreate(config, stateData) {
  pushAndUpdate(config, "virtual_private_endpoints", stateData);
}

/**
 * @param {lazyZState} config state store
 * @param {Object} stateData vpe state data
 * @param {Object} stateData.vpe vpe object
 * @param {string} stateData.vpe.service name of vpe service
 * @param {string} stateData.vpe.resource_group resource group
 * @param {string} stateData.vpe.service_type service catalog name (ex. cloud-object-storage)
 * @param {Object} stateData.vpcData map of vpc data where each key points to the value of a vpc object to store in vpe.vpcs
 * @param {Object} componentProps vpe form props
 * @param {Object} componentProps.data vpe from props
 * @param {string} componentProps.data.service_name original name of service used to update data in place
 */
function vpeSave(config, stateData, componentProps) {
  new revision(config.store.json).updateChild(
    "virtual_private_endpoints",
    componentProps.data.name,
    "name",
    stateData
  );
}

/**
 * handle delete vpe object from store
 * @param {lazyZState} config state store
 * @param {Object} stateData vpe state data
 * @param {Object} componentProps vpe form props
 * @param {Object} componentProps.data vpe from props
 * @param {string} componentProps.data.service original name of service used to delete object
 */
function vpeDelete(config, stateData, componentProps) {
  carve(
    config.store.json.virtual_private_endpoints,
    "name",
    componentProps.data.name
  );
}

module.exports = {
  vpeInit,
  vpeOnStoreUpdate,
  vpeCreate,
  vpeSave,
  vpeDelete
};
