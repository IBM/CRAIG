const {
  transpose,
  splat,
  splatContains,
  eachZone,
  parseIntFromZone,
  getObjectFromArray,
} = require("lazy-z");

/**
 * get craig data from slz
 * @param {JSON} slz secure landing zone config/override
 * @returns {JSON} craig json
 */
function slzToCraig(slz, prefix) {
  let craig = {
    _options: {
      prefix: prefix,
      region: "",
      tags: ["slz", "landing-zone"],
    },
    resource_groups: [],
    key_management: [{}], // slz can only have one kms instance
    object_storage: [],
    secrets_manager: [],
    vpcs: [],
    virtual_private_endpoints: [],
    security_groups: [],
    vpn_gateways: [],
    ssh_keys: [],
    transit_gateways: [],
    clusters: [],
    vsi: [],
    appid: [],
    teleport_vsi: [],
    scc: {
      enable: false,
      id: null,
      name: null,
      credential_description: null,
    },
    f5_vsi: [],
  };

  /**
   * get value with no prefix
   * @param {string} str
   * @returns {string} string with prefix replaced
   */
  function noPrefix(str) {
    return str.replace(craig._options.prefix + "-", "");
  }

  // resource groups
  slz.resource_groups.forEach((group) => {
    craig.resource_groups.push({
      name: group.name,
      use_data: group.create === false,
      use_prefix: group.use_prefix === true,
    });
  });

  let kmsKeys = []; // list of keys
  let kms = noPrefix(slz.key_management.name); // kms name for reference
  let bucketToInstanceMap = {}; // map of cos bucket to instance

  // handle key management keys
  slz.key_management.keys.forEach((key) => {
    kmsKeys.push({
      dual_auth_delete: false,
      name: noPrefix(key.name),
      endpoint: key.endpoint || "private",
      force_delete: key.force_delete || false,
      root_key: key.root_key,
      key_ring: noPrefix(key.key_ring),
      rotation: !key.policies ? 12 : key.policies.rotation.interval_month,
    });
  });

  // set key management instance data
  transpose(
    {
      keys: kmsKeys,
      authorize_vpc_reader_role: true,
      name: kms,
      resource_group: slz.key_management.resource_group,
      use_data: slz.key_management.use_data === true,
      use_hs_crypto: slz.key_management.use_hs_crypto,
    },
    craig.key_management[0]
  );

  // handle object storage
  slz.cos.forEach((instance) => {
    let cos = {
      kms: kms,
      name: instance.name,
      plan: instance.plan,
      resource_group: instance.resource_group,
      use_random_suffix: instance.random_suffix === true,
      use_data: instance.use_data,
      buckets: [],
      keys: [],
    };
    // handle cose buckets
    instance.buckets.forEach((bucket) => {
      cos.buckets.push({
        endpoint: bucket.endpoint_type,
        force_delete: bucket.force_delete,
        kms_key: noPrefix(bucket.kms_key),
        name: bucket.name,
        storage_class: bucket.storage_class,
      });
    });
    // handle keys
    instance.keys.forEach((key) => {
      let newKey = {};
      transpose(key, newKey);
      newKey.enable_hmac = key.enable_HMAC;
      delete newKey.enable_HMAC;
      cos.keys.push(newKey);
    });
    craig.object_storage.push(cos);
  });

  // handle secrets manager
  if (slz.secrets_manager?.use_secrets_manager) {
    let secretsManager = {
      kms: kms,
      resource_group: slz.secrets_manager.resource_group,
      name: slz.secrets_manager.name,
      encryption_key: noPrefix(slz.secrets_manager.kms_key_name),
    };
    craig.secrets_manager.push(secretsManager);
  }

  // handle atracker
  craig.atracker = {
    add_route: slz.atracker.add_route,
    bucket: slz.atracker.collector_bucket_name,
    locations: ["global"],
    enabled: true,
    type: "cos",
    name: "atracker",
    cos_key: null,
  };

  // create bucket to instance map and fetch atracker key
  craig.object_storage.forEach((instance) => {
    if (
      splatContains(
        instance.buckets,
        "name",
        slz.atracker.collector_bucket_name
      )
    ) {
      craig.atracker.target_name = instance.name;
      if (instance.keys.length > 0) {
        // set atracker key if able
        craig.atracker.cos_key = instance.keys[0].name;
      }
    }
    // set bucket to instance map
    splat(instance.buckets, "name").forEach((bucket) => {
      bucketToInstanceMap[bucket] = instance.name;
    });
  });

  // get vpcs
  slz.vpcs.forEach((vpc) => {
    let craigVpc = {
      name: vpc.prefix,
      public_gateways: [],
      acls: [],
      subnets: [],
      address_prefixes: [],
      bucket: vpc.flow_logs_bucket_name,
      manual_address_prefix_management: true,
      cos: bucketToInstanceMap[vpc.flow_logs_bucket_name], // fetch cos instance
    };
    // direct value references
    [
      "classic_access",
      "default_network_acl_name",
      "default_routing_table_name",
      "default_security_group_name",
      "resource_group",
    ].forEach((field) => {
      craigVpc[field] = vpc[field]
        ? vpc[field]
        : field === "classic_access"
        ? false
        : null;
    });
    // for each zone
    eachZone(3, (zone) => {
      // if address prefixes are added to slz object they are for f5
      if (vpc.address_prefixes)
        vpc.address_prefixes[zone].forEach((prefix) => {
          craigVpc.address_prefixes.push({
            vpc: vpc.prefix,
            zone: parseIntFromZone(zone),
            cidr: prefix,
            name: `f5-${zone}`,
          });
        });
      // get subnets
      vpc.subnets[zone].forEach((subnet) => {
        let isF5 = splatContains(
          craigVpc.address_prefixes,
          "name",
          "f5-zone-1"
        );
        craigVpc.subnets.push({
          name: subnet.name,
          network_acl: subnet.acl_name.replace(/-acl$/g, ""), // remove acl name
          cidr: subnet.cidr,
          has_prefix: isF5 === false, // f5 will not have prefix
          vpc: vpc.prefix,
          zone: parseIntFromZone(zone),
          public_gateway: subnet.public_gateway,
          resource_group: vpc.resource_group,
        });
        if (!isF5) {
          // add address prefixes for non-f5 subnets
          craigVpc.address_prefixes.push({
            name: subnet.name,
            cidr: subnet.cidr,
            zone: parseIntFromZone(zone),
            vpc: vpc.prefix,
          });
        }
      });
    });

    // handle acls
    vpc.network_acls.forEach((acl) => {
      let craigAcl = {
        resource_group: vpc.resource_group,
        name: acl.name.replace(/-acl$/g, ""),
        vpc: vpc.prefix,
        rules: [],
      };
      // add cluster rules here
      acl.rules.forEach((rule) => {
        rule.vpc = vpc.prefix;
        rule.acl = acl.name.replace(/-acl$/g, "");
        craigAcl.rules.push(rule);
      });
      craigVpc.acls.push(craigAcl);
    });
    craig.vpcs.push(craigVpc);
  });

  // set vpes
  slz.virtual_private_endpoints.forEach((vpe) => {
    // craig only vpc
    vpe.vpcs.forEach((vpc) => {
      let craigVpe = {
        vpc: vpc.name + "-cos",
        subnets: vpc.subnets,
        service: "cos",
        security_groups: vpc.security_group_name
          ? [vpc.security_group_name.replace(/-sg$/g, "")]
          : [], // slz only allows one sg for vpe
        resource_group: vpe.resource_group,
      };
      craig.virtual_private_endpoints.push(craigVpe);
    });
  });

  // handle security groups
  slz.security_groups.forEach((group) => {
    let craigSg = {
      vpc: group.vpc_name,
      name: group.name.replace(/-sg$/g, ""),
      resource_group: getObjectFromArray(craig.vpcs, "name", group.vpc_name)
        .resource_group,
      rules: [],
    };
    group.rules.forEach((rule) => {
      rule.sg = craigSg.name;
      rule.vpc = craigSg.vpc;
      craigSg.rules.push(rule);
    });
    craig.security_groups.push(craigSg);
  });

  // handle vsi
  ["vsi", "teleport_vsi"].forEach((vsi) => {
    if (slz[vsi])
      slz[vsi].forEach((instance) => {
        // add vsi sg to craig sg list
        let craigSg = {
          vpc: instance.vpc_name.replace(/-sg$/g, ""),
          name: instance.security_group.name + "-vsi",
          resource_group: instance.resource_group || null,
          rules: [],
        };
        instance.security_group.rules.forEach((rule) => {
          rule.sg = craigSg.name;
          rule.vpc = craigSg.vpc;
          craigSg.rules.push(rule);
        });
        craig.security_groups.push(craigSg);
        if (vsi === "vsi") {
          // handle add bsi
          let craigVsi = {
            kms: kms,
            encryption_key: noPrefix(instance.boot_volume_encryption_key_name),
            image: instance.image_name,
            profile: instance.machine_type,
            name: instance.name,
            resource_group: instance.resource_group || null,
            security_groups: [instance.security_group.name + "-vsi"],
            ssh_keys: [],
            subnets: instance.subnet_names,
            vpc: instance.vpc_name,
            vsi_per_subnet: instance.vsi_per_subnet,
          };
          if (instance.security_groups)
            instance.security_groups.forEach((group) => {
              craigVsi.security_groups.push(group.replace(/-sg$/g, ""));
            });
          instance.ssh_keys.forEach((key) =>
            craigVsi.ssh_keys.push(noPrefix(key))
          );
          craig.vsi.push(craigVsi);
        } else {
          let craigTeleportVsi = {
            appid: slz.appid.name,
            encryption_key: noPrefix(instance.boot_volume_encryption_key_name),
            image: instance.image_name,
            profile: instance.machine_type,
            resource_group: instance.resource_group,
            security_groups: [instance.security_group.name + "-vsi"],
            vpc: instance.vpc_name,
            ssh_keys: [],
            kms: kms,
            name: instance.name,
            subnet: instance.subnet_name,
            template: {
              appid: slz.appid.name,
              appid_key: slz.teleport_config.app_id_key_name,
              cos: bucketToInstanceMap[slz.teleport_config.cos_bucket_name],
              bucket: slz.teleport_config.cos_bucket_name,
              cos_key: slz.teleport_config.cos_key_name,
              deployment: instance.name,
              domain: slz.teleport_config.domain,
              hostname: slz.teleport_config.hostname,
              message_of_the_day: slz.teleport_config.message_of_the_day,
              version: slz.teleport_config.teleport_version,
              https_key: slz.teleport_config.https_key,
              https_cert: slz.teleport_config.https_cert,
              license: slz.teleport_config.teleport_license,
              claim_to_roles: slz.teleport_config.claims_to_roles,
            },
          };
          instance.security_groups.forEach((group) => {
            craigTeleportVsi.security_groups.push(group.replace(/-sg$/g, ""));
          });
          instance.ssh_keys.forEach((key) =>
            craigTeleportVsi.ssh_keys.push(noPrefix(key))
          );
          craig.teleport_vsi.push(craigTeleportVsi);
        }
      });
  });

  // handle vpn gateways
  slz.vpn_gateways.forEach((gw) => {
    craig.vpn_gateways.push({
      name: gw.name,
      resource_group: gw.resource_group,
      subnet: gw.subnet_name,
      vpc: gw.vpc_name,
    });
  });

  // handle ssh keys
  slz.ssh_keys.forEach((key) => {
    craig.ssh_keys.push({
      name: noPrefix(key.name),
      use_data: false,
      resource_group: key.resource_group || null,
      public_key: key.public_key,
    });
  });

  if (slz.enable_transit_gateway) {
    // if tgw enabled, handle tgw
    craig.transit_gateways.push({
      global: false,
      name: "transit-gateway",
      resource_group: slz.transit_gateway_resource_group,
      connections: [],
    });
    slz.transit_gateway_connections.forEach((vpc) => {
      craig.transit_gateways[0].connections.push({
        tgw: "transit-gateway",
        vpc: vpc,
      });
    });
  }

  // handle clusters
  slz.clusters.forEach((cluster) => {
    let craigCluster = {
      cos: cluster.cos_name || null,
      entitlement: cluster.entitlement || null,
      encryption_key: noPrefix(cluster.kms_config.crk_name),
      flavor: cluster.machine_type,
      kube_version: cluster.kube_version,
      kms: kms,
      name: cluster.name.replace(/-cluster$/g, ""),
      private_endpoint: true,
      resource_group: cluster.resource_group,
      subnets: cluster.subnet_names,
      type: cluster.kube_type,
      update_all_workers: cluster.update_all_workers,
      vpc: cluster.vpc_name,
      workers_per_subnet: cluster.workers_per_subnet,
      worker_pools: [],
    };
    // handle worker pools for cluster
    cluster.worker_pools.forEach((pool) => {
      let craigPool = {
        name: pool.name,
        cluster: craigCluster.name,
        entitlement: pool.entitlement || null,
        resource_group: cluster.resource_group,
        flavor: pool.flavor,
        vpc: craigCluster.vpc,
        subnets: pool.subnet_names,
        workers_per_subnet: pool.workers_per_subnet,
      };
      craigCluster.worker_pools.push(craigPool);
    });
    craig.clusters.push(craigCluster);
  });

  if (slz.appid?.use_appid) {
    let craigAppId = {
      name: slz.appid.name,
      resource_group: slz.appid.resource_group,
      use_data: slz.appid.use_data,
      keys: [],
    };
    slz.appid.keys.forEach((key) => {
      craigAppId.keys.push({
        name: key,
        appid: craigAppId.name,
      });
    });
    craig.appid.push(craigAppId);
  }

  if (slz.security_compliance_center.enable_scc) {
    let scc = slz.security_compliance_center;
    craig.scc.enable = true;
    craig.scc.is_public = scc.is_public;
    craig.scc.passphrase = scc.collector_passphrase;
    craig.scc.collector_description = scc.collector_description;
    craig.scc.location = scc.location_id;
    craig.scc.scope_description = scc.scope_description;
  }

  if (slz.f5_vsi)
    slz.f5_vsi.forEach((instance) => {
      let craigF5 = {
        encryption_key: noPrefix(instance.boot_volume_encryption_key_name),
        image: instance.f5_image_name,
        kms: kms,
        name: instance.name,
        network_interfaces: [],
        profile: instance.machine_type,
        resource_group: instance.resource_group,
        security_groups: [],
        ssh_keys: [],
        subnet: instance.primary_subnet_name,
        vpc: instance.vpc_name,
        template: {
          vpc: instance.vpc_name,
          zone: parseInt(instance.name.replace(/(f5)|\D/g, "")),
          hostname: instance.hostname,
          domain: instance.domain,
        },
      };
      transpose(slz.f5_template_data, craigF5.template);
      instance.security_groups.forEach((group) => {
        craigF5.security_groups.push(group.replace(/-sg$/g, ""));
      });
      instance.ssh_keys.forEach((key) => craigF5.ssh_keys.push(noPrefix(key)));
      // handle additional network interfaces
      instance.secondary_subnet_security_group_names.forEach((inf) => {
        craigF5.network_interfaces.push({
          security_groups: [inf.group_name.replace(/-sg/g, "")],
          subnet: noPrefix(
            inf.interface_name.replace(instance.vpc_name + "-", "")
          ),
        });
      });
      craig.f5_vsi.push(craigF5);
    });

  return craig;
}

module.exports = {
  slzToCraig,
};
