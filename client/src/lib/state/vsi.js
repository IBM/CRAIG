const {
  revision,
  contains,
  transpose,
  camelCase,
  splat,
  splatContains
} = require("lazy-z");
const { newDefaultManagementServer } = require("./defaults");
const {
  setUnfoundEncryptionKey,
  setUnfoundResourceGroup,
  hasUnfoundVpc,
  pushAndUpdate,
  updateChild,
  carveChild,
  updateSubChild,
  deleteSubChild,
  pushToChildFieldModal
} = require("./store.utils");

/**
 * initialize vsi
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 */
function vsiInit(config) {
  config.store.json.vsi = [newDefaultManagementServer()];
  config.store.json.security_groups.push({
    vpc: "management",
    name: "management-vsi",
    resource_group: "management-rg",
    rules: [
      {
        vpc: "management",
        sg: "management-vsi",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        udp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          type: null,
          code: null
        }
      },
      {
        vpc: "management",
        sg: "management-vsi",
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        udp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          type: null,
          code: null
        }
      },
      {
        vpc: "management",
        sg: "management-vsi",
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        udp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          type: null,
          code: null
        }
      },
      {
        vpc: "management",
        sg: "management-vsi",
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        udp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          type: null,
          code: null
        }
      },
      {
        vpc: "management",
        sg: "management-vsi",
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        udp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          type: null,
          code: null
        }
      },
      {
        vpc: "management",
        sg: "management-vsi",
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        udp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          type: null,
          code: null
        }
      }
    ]
  });
  config.store.json.teleport_vsi = [];
}

/**
 * update vsi based on key
 * @param {lazyZState} config state store
 * @param {object} config.store state store
 * @param {object} config.store.json configuration JSON
 * @param {object} config.store.subnets map of subnets
 * @param {string} key field to lookup
 */
function updateVsi(config, key) {
  // get data based on key
  new revision(config.store.json).child(key).then(data => {
    // for each deployment
    data.forEach(deployment => {
      let validVpc = hasUnfoundVpc(config, deployment) === false;
      if (!deployment.kms) {
        deployment.encryption_key = null;
      }
      setUnfoundEncryptionKey(config, deployment, "encryption_key");
      setUnfoundResourceGroup(config, deployment);
      // if teleport vsi and vpc is valid
      if (validVpc && key === "teleport_vsi") {
        if (
          !contains(config.store.subnets[deployment.vpc], deployment.subnet)
        ) {
          deployment.subnet = null;
        }
      } else if (!validVpc) {
        deployment.vpc = null;
        if (key === "teleport_vsi") deployment.subnet = null;
        else deployment.subnets = [];
      }

      if (key === "teleport_vsi") {
        if (!splatContains(config.store.json.appid, "name", deployment.appid))
          deployment.appid = null;
      }
    });
    config.store[camelCase(key + " List")] = splat(data, "name");
  });
}

/**
 * vsi on store update
 * @param {object} config.store state store
 **/
function vsiOnStoreUpdate(config) {
  ["teleport_vsi", "vsi"].forEach(key => {
    updateVsi(config, key);
  });
}

/**
 * create a new vsi deployment
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {Array<string>} stateData.ssh_keys
 * @param {string} stateData.vpc
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 */
function vsiCreate(config, stateData, componentProps) {
  // default vsi values
  let defaultVsi = {
    kms: null,
    encryption_key: null,
    image: null,
    image_name: null,
    profile: null,
    name: null,
    security_groups: [],
    ssh_keys: stateData.ssh_keys || [], // or is placeholder, no vsi should be created without ssh key,
    vpc: stateData.vpc,
    vsi_per_subnet: null,
    resource_group: null,
    override_vsi_name: null,
    user_data: null,
    network_interfaces: [],
    subnets: stateData.subnets || [],
    volumes: []
  };
  if (stateData.image_name)
    stateData.image = stateData.image_name
      .replace(/[^\[]+\[/g, "")
      .replace(/]/g, "");
  transpose(stateData, defaultVsi);

  // if overriding key
  if (componentProps.isTeleport) {
    defaultVsi.subnet = stateData.subnet; // set subnet name to null for teleport / f5
    // delete vsi only fields and set security group name
    delete defaultVsi.user_data;
    delete defaultVsi.override_vsi_name;
    delete defaultVsi.network_interfaces;
    delete defaultVsi.vsi_per_subnet;
    delete defaultVsi.subnets;
  }

  pushAndUpdate(
    config,
    componentProps.isTeleport ? "teleport_vsi" : "vsi",
    defaultVsi
  );
}

/**
 * save vsi deployment
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {boolean} stateData.hideSecurityGroup
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 */
function vsiSave(config, stateData, componentProps) {
  if (
    componentProps.isTeleport &&
    stateData.name !== componentProps.data.name
  ) {
    stateData.template.deployment = stateData.name;
  }
  if (stateData.image_name)
    stateData.image = stateData.image_name
      .replace(/[^\[]+\[/g, "")
      .replace(/]/g, "");
  config.store.json.key_management.forEach(kms => {
    if (splatContains(kms.keys, "name", stateData.encryption_key)) {
      stateData.kms = kms.name;
    }
  });
  updateChild(
    config,
    componentProps.isTeleport ? "teleport_vsi" : "vsi",
    stateData,
    componentProps
  );
}

/**
 * delete vsi deployment
 * @param {lazyZState} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {boolean} componentProps.isTeleport
 */
function vsiDelete(config, stateData, componentProps) {
  carveChild(
    config,
    componentProps.isTeleport ? "teleport_vsi" : "vsi",
    componentProps
  );
}

/**
 * create new vsi volume
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vsi
 * @param {Array<Object>} config.store.json.vsi.volumes
 * @param {object} stateData component state data
 */
function vsiVolumeCreate(config, stateData, componentProps) {
  pushToChildFieldModal(config, "vsi", "volumes", stateData, componentProps);
}

/**
 * update vsi volume
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vsi
 * @param {Array<Object>} config.store.json.vsi.volumes
 * @param {object} stateData component state data
 */
function vsiVolumeSave(config, stateData, componentProps) {
  updateSubChild(config, "vsi", "volumes", stateData, componentProps);
}

/**
 * delete a vsi volume
 * @param {lazyZstate} config
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.vsi
 * @param {Array<Object>} config.store.json.vsi.volumes
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {string} componentProps.data.name original name
 */
function vsiVolumeDelete(config, stateData, componentProps) {
  deleteSubChild(config, "vsi", "volumes", componentProps);
}

module.exports = {
  vsiOnStoreUpdate,
  vsiSave,
  vsiDelete,
  vsiCreate,
  vsiInit,
  vsiVolumeCreate,
  vsiVolumeSave,
  vsiVolumeDelete
};
