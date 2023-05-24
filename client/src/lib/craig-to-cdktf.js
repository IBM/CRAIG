const {
  splat,
  distinct,
  snakeCase,
  contains,
  titleCase,
  transpose,
  eachKey,
} = require("lazy-z");
const {
  ibmAtrackerRoute,
  ibmAtrackerTarget,
  ibmContainerVpcCluster,
  ibmContainerVpcWorkerPool,
  ibmIsSshKey,
  ibmTgGateway,
  ibmTgConnection,
  ibmIsSecurityGroup,
  ibmIsSecurityGroupRule,
  ibmResourceInstanceCos,
  ibmCosBucket,
  ibmResourceKeyCos,
  ibmIamAuthorizationPolicyKms,
  ibmResourceInstanceKms,
  ibmKmsKeyRings,
  ibmKmsKey,
  ibmKmsKeyPolicy,
  ibmIamAuthorizationPolicyFlowLogs,
  ibmIsFlowLog,
  ibmIamAuthorizationPolicyCos,
  ibmIsSubnetReservedIp,
  ibmIsVirtualEndpointGateway,
  ibmIsVirtualEndpointGatewayIp,
  ibmIsInstance,
  ibmIsVpc,
  ibmIsVpcAddressPrefix,
  ibmIsNetworkAcl,
  ibmIsNetworkAclRule,
  ibmIsSubnet,
  ibmIsVpnGateway,
  f5Images,
  f5Locals,
  f5TemplateFile,
  ibmResourceInstanceSecretsManager,
  ibmIamAuthorizationPolicySecretsManager,
  ibmResourceInstanceEventStreams,
  ibmResourceInstanceAppId,
  ibmResourceKeyAppId,
  ibmSccAccountSettings,
  ibmSccPostureCredential,
  ibmSccPostureCollector,
  ibmSccPostureScope,
  ibmIsLbPoolMembers,
  ibmIsLb,
  ibmIsLbPool,
  ibmIsLbListener,
  ibmIsPublicGateway,
  ibmIsVolume,
  ibmIsVpnServer,
  ibmIsVpnServerRoute,
  ibmIamAccountSettings,
  ibmIamAccessGroup,
  ibmIamAccessGroupDynamicRule,
  ibmIamAccessGroupPolicy,
  ibmIamAccessGroupMembers,
  ibmCbrZone,
  ibmCbrRule,
  vpcModuleJson,
  vpcModuleOutputs,
} = require("./json-to-iac");
const { cdktfValues, getResourceOrData } = require("./json-to-iac/utils");
const { varDotRegion, varDotPrefix } = require("./constants");

/**
 * create vpc modules from craig
 * @param {*} craig
 * @returns {Array<object>} array of cdktf definitions for vpc module
 */
function craigToVpcModuleCdktf(craig) {
  let vpcModules = [];
  craig.vpcs.forEach((vpc) => {
    let vpcRgs = [];
    let moduleJson = {
      resource: {},
      output: vpcModuleOutputs(vpc, craig.security_groups),
      terraform: {
        required_providers: {
          ibm: {
            source: "IBM-Cloud/ibm",
            version: "1.44.1",
          },
        },
      },
      variable: {
        tags: {
          description: "List of tags",
          type: "${list(string)}",
        },
        region: {
          description: "IBM Cloud Region where resources will be provisioned",
          type: "${string}",
        },
        prefix: {
          description: "Name prefix that will be prepended to named resources",
          type: "${string}",
        },
      },
    };
    let nw = ibmIsVpc(vpc, craig);
    cdktfValues(moduleJson, "resource", "ibm_is_vpc", nw.name, nw.data);
    vpc.address_prefixes.forEach((prefix) => {
      let cidr = ibmIsVpcAddressPrefix(prefix, craig);
      cdktfValues(
        moduleJson,
        "resource",
        "ibm_is_vpc_address_prefix",
        cidr.name,
        cidr.data
      );
    });
    vpc.acls.forEach((nacl) => {
      let acl = ibmIsNetworkAcl(nacl, craig);
      cdktfValues(
        moduleJson,
        "resource",
        "ibm_is_network_acl",
        acl.name,
        acl.data
      );
      nacl.rules.forEach((aclRule) => {
        let rule = ibmIsNetworkAclRule(aclRule);
        cdktfValues(
          moduleJson,
          "resource",
          "ibm_is_network_acl_rule",
          rule.name,
          rule.data
        );
      });
      vpcRgs.push(nacl.resource_group);
    });
    vpc.subnets.forEach((sub) => {
      let subnet = ibmIsSubnet(sub, craig);
      cdktfValues(
        moduleJson,
        "resource",
        "ibm_is_subnet",
        subnet.name,
        subnet.data
      );
      vpcRgs.push(sub.resource_group);
    });

    vpc.public_gateways.forEach((gw) => {
      let pgw = ibmIsPublicGateway(gw, craig);
      cdktfValues(
        moduleJson,
        "resource",
        "ibm_is_public_gateway",
        pgw.name,
        pgw.data
      );
    });

    craig.security_groups.forEach((sg) => {
      if (sg.vpc === vpc.name) {
        let group = ibmIsSecurityGroup(sg, craig);
        cdktfValues(
          moduleJson,
          "resource",
          "ibm_is_security_group",
          group.name,
          group.data
        );
        sg.rules.forEach((rule) => {
          let data = ibmIsSecurityGroupRule(rule);
          cdktfValues(
            moduleJson,
            "resource",
            "ibm_is_security_group_rule",
            data.name,
            data.data
          );
        });
      }
    });
    distinct(vpcRgs).forEach((rg) => {
      moduleJson.variable[snakeCase(rg) + "_id"] = {
        description: "ID for the resource group " + rg,
        type: "${string}",
      };
    });
    vpcModules.push(moduleJson);
  });
  return vpcModules;
}

/**
 * create cdktf object
 * @param {*} craig
 * @returns {object} cdktf object
 */
function craigToCdktf(craig) {
  let tags = craig._options.tags;
  let prefix = craig._options.prefix;
  let cdktfJson = {
    provider: {
      ibm: [
        {
          ibmcloud_api_key: "${var.ibmcloud_api_key}",
          region: varDotRegion,
        },
      ],
    },
    module: {},
    data: {},
    resource: {},
    variable: {
      ibmcloud_api_key: {
        description:
          "The IBM Cloud platform API key needed to deploy IAM enabled resources.",
        sensitive: true,
      },
    },
    terraform: {
      required_providers: {
        ibm: {
          source: "IBM-Cloud/ibm",
          version: "1.44.1",
        },
      },
    },
  };

  // atracker target
  if (craig.atracker.enabled) {
    let target = ibmAtrackerTarget(craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_atracker_target",
      target.name,
      target.data
    );
    // atracker route
    let route = ibmAtrackerRoute(craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_atracker_route",
      route.name,
      route.data
    );
  }

  // clusters
  craig.clusters.forEach((cluster) => {
    // address for name
    let clusterData = ibmContainerVpcCluster(cluster, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_container_vpc_cluster",
      clusterData.name,
      clusterData.data
    );

    // add worker pool
    cluster.worker_pools.forEach((pool) => {
      let poolData = ibmContainerVpcWorkerPool(pool, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_container_vpc_worker_pool",
        poolData.name,
        poolData.data
      );
    });
  });

  // flow logs auth policies
  distinct(splat(craig.vpcs, "cos")).forEach((cos) => {
    let auth = ibmIamAuthorizationPolicyFlowLogs(cos, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_iam_authorization_policy",
      auth.name,
      auth.data
    );
  });

  // vpcs
  craig.vpcs.forEach((vpc) => {
    let logs = ibmIsFlowLog(vpc, craig, true);
    let vpcRgs = [];
    cdktfValues(cdktfJson, "resource", "ibm_is_flow_log", logs.name, logs.data);
    vpc.acls.forEach((nacl) => {
      if (!contains(vpcRgs, nacl.resource_group)) {
        vpcRgs.push(nacl.resource_group);
      }
    });
    vpc.subnets.forEach((sub) => {
      if (!contains(vpcRgs, sub.resource_group)) {
        vpcRgs.push(sub.resource_group);
      }
    });
    if (!contains(vpcRgs, vpc.resource_group)) {
      vpcRgs.push(vpc.resource_group);
    }
    transpose(vpcModuleJson(vpc, vpcRgs, craig), cdktfJson.module);
  });

  // resource groups
  craig.resource_groups.forEach((rg) => {
    let type = getResourceOrData(rg);
    cdktfValues(cdktfJson, type, "ibm_resource_group", rg.name, {
      name: (rg.use_prefix ? `${varDotPrefix}-` : "") + rg.name,
      tags: tags,
    });
  });

  // object storage
  craig.object_storage.forEach((cos) => {
    let instance = ibmResourceInstanceCos(cos, craig);
    let auth = ibmIamAuthorizationPolicyCos(cos, craig);
    if (cos.use_random_suffix) {
      cdktfValues(
        cdktfJson,
        "resource",
        "random_string",
        `${cos.name}_random_suffix`,
        {
          length: 8,
          special: false,
          upper: false,
        }
      );
    }
    cdktfValues(
      cdktfJson,
      getResourceOrData(cos),
      "ibm_resource_instance",
      instance.name,
      instance.data
    );
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_iam_authorization_policy",
      auth.name,
      auth.data
    );
    cos.buckets.forEach((bucket) => {
      let data = ibmCosBucket(bucket, cos, craig, true);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_cos_bucket",
        data.name,
        data.data
      );
    });
    cos.keys.forEach((key) => {
      let data = ibmResourceKeyCos(key, cos, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_resource_key",
        data.name,
        data.data
      );
    });
  });

  // kms
  craig.key_management.forEach((kms) => {
    // set vpc auth policies
    if (kms.authorize_vpc_reader_role) {
      let is = ibmIamAuthorizationPolicyKms(kms, true);
      let serverProtect = ibmIamAuthorizationPolicyKms(kms);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_iam_authorization_policy",
        is.name,
        is.data
      );
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_iam_authorization_policy",
        serverProtect.name,
        serverProtect.data
      );
    }
    let instance = ibmResourceInstanceKms(kms, craig);
    cdktfValues(
      cdktfJson,
      getResourceOrData(kms),
      "ibm_resource_instance",
      instance.name,
      instance.data
    );

    // create key rings
    distinct(splat(kms.keys, "key_ring")).forEach((ring) => {
      let tf = ibmKmsKeyRings(ring, kms, craig);
      cdktfValues(cdktfJson, "resource", "ibm_kms_key_rings", tf.name, tf.data);
    });

    // create keys
    kms.keys.forEach((key) => {
      let keyTf = ibmKmsKey(key, kms, craig, true);
      let policy = ibmKmsKeyPolicy(key, kms, craig);
      cdktfValues(cdktfJson, "resource", "ibm_kms_key", keyTf.name, keyTf.data);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_kms_key_policies",
        policy.name,
        policy.data
      );
    });
  });

  // ssh keys
  craig.ssh_keys.forEach((key) => {
    let sshKey = ibmIsSshKey(key, craig);
    if (!key.use_data) {
      cdktfJson.variable[snakeCase(key.name) + "_public_key"] = {
        default: key.public_key,
        description: `Public SSH Key Value for ${titleCase(key.name).replace(
          /Ssh/g,
          "SSH"
        )}`,
        type: "string",
        sensitive: true,
      };
    }
    cdktfValues(
      cdktfJson,
      getResourceOrData(key),
      "ibm_is_ssh_key",
      sshKey.name,
      sshKey.data
    );
  });

  // handle tgw
  craig.transit_gateways.forEach((tgw) => {
    let gw = ibmTgGateway(tgw, craig);
    cdktfValues(cdktfJson, "resource", "ibm_tg_gateway", gw.name, gw.data);

    // handle tgw connections
    tgw.connections.forEach((connection) => {
      let data = ibmTgConnection(connection, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_tg_connection",
        data.name,
        data.data
      );
    });
  });

  // vpes
  craig.virtual_private_endpoints.forEach((vpe) => {
    vpe.subnets.forEach((subnet) => {
      let reservedIp = ibmIsSubnetReservedIp(vpe.vpc, subnet);
      let endpoint = ibmIsVirtualEndpointGatewayIp(vpe, subnet);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_is_subnet_reserved_ip",
        reservedIp.name,
        reservedIp.data
      );
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_is_virtual_endpoint_gateway_ip",
        endpoint.name,
        endpoint.data
      );
    });
    let gw = ibmIsVirtualEndpointGateway(vpe, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_is_virtual_endpoint_gateway",
      gw.name,
      gw.data
    );
  });

  // vsis
  craig.vsi.forEach((deployment) => {
    deployment.subnets.forEach((subnet) => {
      for (let i = 0; i < deployment.vsi_per_subnet; i++) {
        let instance = {};
        transpose(deployment, instance);
        instance.subnet = subnet;
        instance.index = i + 1;
        let vsi = ibmIsInstance(instance, craig);
        cdktfValues(
          cdktfJson,
          "resource",
          "ibm_is_instance",
          vsi.name,
          vsi.data
        );
        if (!contains(instance.image, "local")) {
          cdktfValues(cdktfJson, "data", "ibm_is_image", instance.image, {
            name: instance.image,
          });
        }
        if (deployment.volumes) {
          ibmIsVolume(instance, craig).forEach((volume) => {
            cdktfValues(
              cdktfJson,
              "resource",
              "ibm_is_volume",
              volume.name,
              volume.data
            );
          });
        }
      }
    });
  });

  // // vpn servers
  if (craig.vpn_servers) {
    craig.vpn_servers.forEach((vpnServer) => {
      let server = ibmIsVpnServer(vpnServer, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_is_vpn_server",
        server.name,
        server.data
      );
      vpnServer.routes.forEach((vpnRoute) => {
        let route = ibmIsVpnServerRoute(vpnServer, vpnRoute, craig);
        cdktfValues(
          cdktfJson,
          "resource",
          "ibm_is_vpn_server_route",
          route.name,
          route.data
        );
      });
    });
  }

  // vpn gateways
  craig.vpn_gateways.forEach((vpnGw) => {
    let vpn = ibmIsVpnGateway(vpnGw, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_is_vpn_gateway",
      vpn.name,
      vpn.data
    );
  });

  // f5
  if (craig.f5_vsi && craig.f5_vsi.length > 0) cdktfJson.locals = {};

  if (craig.f5_vsi && craig.f5_vsi.length > 0) {
    let images = f5Images();
    eachKey(images, (key) => {
      cdktfJson.locals[key] = images[key];
    });
    let locals = f5Locals(craig.f5_vsi[0].template);
    eachKey(locals, (key) => {
      cdktfJson.locals[key] = locals[key];
    });
    let template = f5TemplateFile(craig.f5_vsi[0].template, craig);
    cdktfValues(
      cdktfJson,
      "data",
      "template_file",
      template.name,
      template.data
    );
  }

  // event streams
  if (craig.event_streams)
    craig.event_streams.forEach((instance) => {
      let es = ibmResourceInstanceEventStreams(instance, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_resource_instance",
        es.name,
        es.data
      );
    });

  // appid
  craig.appid.forEach((instance) => {
    let appid = ibmResourceInstanceAppId(instance, craig);
    cdktfValues(
      cdktfJson,
      getResourceOrData(instance),
      "ibm_resource_instance",
      appid.name,
      appid.data
    );
    instance.keys.forEach((appidKey) => {
      let key = ibmResourceKeyAppId(appidKey, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_resource_key",
        key.name,
        key.data
      );
    });
  });

  // secrets manager
  craig.secrets_manager.forEach((instance) => {
    let auth = ibmIamAuthorizationPolicySecretsManager(instance.kms, craig);
    let secrets = ibmResourceInstanceSecretsManager(instance, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_resource_instance",
      secrets.name,
      secrets.data
    );
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_iam_authorization_policy",
      auth.name,
      auth.data
    );
  });

  // scc
  if (craig.scc.enable) {
    let acct = ibmSccAccountSettings(craig.scc);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_scc_account_settings",
      acct.name,
      acct.data
    );
    let cred = ibmSccPostureCredential(craig.scc);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_scc_posture_credential",
      cred.name,
      cred.data
    );
    let collector = ibmSccPostureCollector(craig.scc, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_scc_posture_collector",
      collector.name,
      collector.data
    );
    let scope = ibmSccPostureScope(craig.scc, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_scc_posture_scope",
      scope.name,
      scope.data
    );
  }

  // load balancers
  if (craig.load_balancers)
    craig.load_balancers.forEach((lb) => {
      let poolData = ibmIsLbPool(lb, craig);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_is_lb_pool",
        poolData.name,
        poolData.data
      );
      let lbData = ibmIsLb(lb, craig);
      cdktfValues(cdktfJson, "resource", "ibm_is_lb", lbData.name, lbData.data);
      let poolMemberData = ibmIsLbPoolMembers(lb, craig);
      poolMemberData.forEach((vsi) => {
        cdktfValues(
          cdktfJson,
          "resource",
          "ibm_is_lb_pool_member",
          vsi.name,
          vsi.data
        );
      });
      let listenerData = ibmIsLbListener(lb, poolMemberData, true);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_is_lb_listener",
        listenerData.name,
        listenerData.data
      );
    });

  // iam account settings
  if (craig.iam_account_settings.enable) {
    let iam = ibmIamAccountSettings(craig.iam_account_settings);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_iam_account_settings",
      iam.name,
      iam.data
    );
  }

  // access groups
  craig.access_groups.forEach((instance) => {
    // access group fields
    let ag = ibmIamAccessGroup(instance, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_iam_access_group",
      ag.name,
      ag.data
    );
    // access group policies
    instance.policies.forEach((policy) => {
      let agPolicy = ibmIamAccessGroupPolicy(policy);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_iam_access_group_policy",
        agPolicy.name,
        agPolicy.data
      );
    });
    // access group dynamic policies
    instance.dynamic_policies.forEach((policy) => {
      let agDynamicPolicy = ibmIamAccessGroupDynamicRule(policy);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_iam_access_group_dynamic_rule",
        agDynamicPolicy.name,
        agDynamicPolicy.data
      );
    });
    // access group invites
    if (instance.has_invites) {
      let agInvite = ibmIamAccessGroupMembers(instance.invites);
      cdktfValues(
        cdktfJson,
        "resource",
        "ibm_iam_access_group_members",
        agInvite.name,
        agInvite.data
      );
    }
  });

  // cbr zones
  craig.cbr_zones.forEach((zone) => {
    let cbrZone = ibmCbrZone(zone, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_cbr_zone",
      cbrZone.name,
      cbrZone.data
    );
  });

  // cbr rules
  craig.cbr_rules.forEach((rule) => {
    let cbrRule = ibmCbrRule(rule, craig);
    cdktfValues(
      cdktfJson,
      "resource",
      "ibm_cbr_rule",
      cbrRule.name,
      cbrRule.data
    );
  });

  return cdktfJson;
}

module.exports = {
  craigToCdktf,
  craigToVpcModuleCdktf,
};
