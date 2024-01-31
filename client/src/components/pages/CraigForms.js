const { contains } = require("lazy-z");
const { edgeRouterEnabledZones } = require("../../lib/constants");
const { disableSave } = require("../../lib");

/**
 * craig forms
 * @param {*} craig
 * @returns {object} key value pair of form fields
 */
function craigForms(craig) {
  return {
    access_groups: {
      jsonField: "access_groups",
      groups: [
        {
          name: craig.access_groups.name,
        },
        {
          description: craig.access_groups.description,
        },
      ],
      subForms: [
        {
          name: "Policies",
          addText: "Create a new Policy",
          jsonField: "policies",
          form: {
            groups: [
              {
                name: craig.access_groups.policies.name,
              },
              {
                heading: {
                  name: "Resource Configuration",
                  type: "subHeading",
                },
              },
              {
                resource: craig.access_groups.policies.resource,
                resource_group: craig.access_groups.policies.resource_group,
              },
              {
                resource_instance_id:
                  craig.access_groups.policies.resource_instance_id,
                service: craig.access_groups.policies.service,
              },
              {
                resource_type: craig.access_groups.policies.resource_type,
              },
            ],
          },
        },
        {
          name: "Dynamic Policies",
          addText: "Create a Dynamic Policy",
          jsonField: "dynamic_policies",
          form: {
            groups: [
              {
                name: craig.access_groups.dynamic_policies.name,
                expiration: craig.access_groups.dynamic_policies.expiration,
              },
              {
                identity_provider:
                  craig.access_groups.dynamic_policies.identity_provider,
              },
              {
                heading: {
                  name: "Condition Configuration",
                  type: "subHeading",
                },
              },
              {
                claim: craig.access_groups.dynamic_policies.claim,
              },
              {
                operator: craig.access_groups.dynamic_policies.operator,
                value: craig.access_groups.dynamic_policies.value,
              },
            ],
          },
        },
      ],
    },
    cbr_zones: {
      jsonField: "cbr_zones",
      groups: [
        {
          name: craig.cbr_zones.name,
          account_id: craig.cbr_zones.account_id,
        },
        {
          description: craig.cbr_zones.description,
        },
      ],
      subForms: [
        {
          name: "Addresses",
          jsonField: "addresses",
          addText: "Create an Address",
          form: {
            groups: [
              {
                name: craig.cbr_zones.addresses.name,
                account_id: craig.cbr_zones.addresses.account_id,
                location: craig.cbr_zones.addresses.location,
              },
              {
                service_name: craig.cbr_zones.addresses.service_name,
                service_instance: craig.cbr_zones.addresses.service_instance,
                service_type: craig.cbr_zones.addresses.service_type,
              },
              {
                type: craig.cbr_zones.addresses.type,
                value: craig.cbr_zones.addresses.value,
              },
            ],
          },
        },
        {
          name: "Exclusions",
          jsonField: "exclusions",
          addText: "Create an Exclusion",
          form: {
            groups: [
              {
                name: craig.cbr_zones.exclusions.name,
                account_id: craig.cbr_zones.exclusions.account_id,
                location: craig.cbr_zones.exclusions.location,
              },
              {
                service_name: craig.cbr_zones.exclusions.service_name,
                service_instance: craig.cbr_zones.exclusions.service_instance,
                service_type: craig.cbr_zones.exclusions.service_type,
              },
              {
                type: craig.cbr_zones.exclusions.type,
                value: craig.cbr_zones.exclusions.value,
              },
            ],
          },
        },
      ],
    },
    cbr_rules: {
      jsonField: "cbr_rules",
      groups: [
        {
          name: craig.cbr_rules.name,
          enforcement_mode: craig.cbr_rules.enforcement_mode,
          api_type_id: craig.cbr_rules.api_type_id,
        },
        {
          description: craig.cbr_rules.description,
        },
      ],
      subForms: [
        {
          name: "Contexts",
          jsonField: "contexts",
          addText: "Create a Context",
          form: {
            groups: [
              {
                name: craig.cbr_rules.contexts.name,
                value: craig.cbr_rules.contexts.value,
              },
            ],
          },
        },
        {
          name: "Resource Attributes",
          jsonField: "resource_attributes",
          addText: "Create a Resource Attribute",
          form: {
            groups: [
              {
                name: craig.cbr_rules.resource_attributes.name,
                value: craig.cbr_rules.resource_attributes.value,
              },
            ],
          },
        },
        {
          name: "Tags",
          jsonField: "tags",
          addText: "Create a Tag",
          form: {
            groups: [
              {
                name: craig.cbr_rules.tags.name,
                operator: craig.cbr_rules.tags.operator,
                value: craig.cbr_rules.tags.value,
              },
            ],
          },
        },
      ],
    },
    appid: {
      jsonField: "appid",
      groups: [
        {
          use_data: craig.appid.use_data,
        },
        {
          name: craig.appid.name,
          resource_group: craig.appid.resource_group,
          encryption_key: craig.appid.encryption_key,
        },
      ],
      subForms: [
        {
          name: "AppID Keys",
          addText: "Create an AppID Key",
          jsonField: "keys",
          form: {
            groups: [
              {
                name: craig.appid.keys.name,
              },
            ],
          },
        },
      ],
    },
    atracker: {
      name: "Activity Tracker",
      jsonField: "atracker",
      disableSave: disableSave,
      groups: [
        {
          enabled: craig.atracker.enabled,
          instance: craig.atracker.instance,
        },
        {
          name: craig.atracker.name,
          locations: craig.atracker.locations,
          bucket: craig.atracker.bucket,
        },
        {
          add_route: craig.atracker.add_route,
          cos_key: craig.atracker.cos_key,
        },
        {
          resource_group: craig.atracker.resource_group,
          plan: craig.atracker.plan,
        },
      ],
    },
    cis: {
      jsonField: "cis",
      setDefault: {
        domains: [],
        dns_records: [],
      },
      groups: [
        {
          name: craig.cis.name,
          resource_group: craig.cis.resource_group,
          plan: craig.cis.plan,
        },
      ],
      subForms: [
        {
          name: "Domains",
          addText: "Add a domain",
          jsonField: "domains",
          toggleFormFieldName: "domain",
          form: {
            groups: [
              {
                domain: craig.cis.domains.domain,
                type: craig.cis.domains.type,
              },
            ],
          },
        },
        {
          name: "DNS Records",
          addText: "Add a DNS Record",
          jsonField: "dns_records",
          hideFormTitleButton: function (stateData, componentProps) {
            return componentProps.data.domains.length === 0;
          },
          form: {
            groups: [
              {
                name: craig.cis.dns_records.name,
                domain: craig.cis.dns_records.domain,
              },
              {
                type: craig.cis.dns_records.type,
                content: craig.cis.dns_records.content,
              },
              {
                ttl: craig.cis.dns_records.ttl,
              },
            ],
          },
        },
      ],
    },
    cis_glbs: {
      jsonField: "cis_glbs",
      groups: [
        {
          name: craig.cis_glbs.name,
          cis: craig.cis_glbs.cis,
        },
        {
          minimum_origins: craig.cis_glbs.minimum_origins,
          enabled: craig.cis_glbs.enabled,
        },
        {
          description: craig.cis_glbs.description,
        },
      ],
      subForms: [
        {
          name: "Origins",
          addText: "Add an Origin",
          jsonField: "origins",
          form: {
            groups: [
              {
                name: craig.cis_glbs.origins.name,
                address: craig.cis_glbs.origins.address,
              },
              {
                enabled: craig.cis_glbs.origins.enabled,
              },
            ],
          },
        },
        {
          name: "Global Load Balancers",
          addText: "Create a Global Load Balancer",
          jsonField: "glbs",
          form: {
            groups: [
              {
                name: craig.cis_glbs.glbs.name,
                domain: craig.cis_glbs.glbs.domain,
              },
              {
                default_pools: craig.cis_glbs.glbs.default_pools,
                fallback_pool: craig.cis_glbs.glbs.fallback_pool,
              },
              {
                ttl: craig.cis_glbs.glbs.ttl,
              },
              {
                enabled: craig.cis_glbs.glbs.enabled,
                proxied: craig.cis_glbs.glbs.proxied,
              },
            ],
          },
        },
        {
          name: "Health Checks",
          addText: "Create a Health Check",
          jsonField: "health_checks",
          form: {
            groups: [
              {
                name: craig.cis_glbs.health_checks.name,
                method: craig.cis_glbs.health_checks.method,
                type: craig.cis_glbs.health_checks.type,
              },
              {
                expected_codes: craig.cis_glbs.health_checks.expected_codes,
                timeout: craig.cis_glbs.health_checks.timeout,
                interval: craig.cis_glbs.health_checks.interval,
              },
              {
                path: craig.cis_glbs.health_checks.path,
                port: craig.cis_glbs.health_checks.port,
                retries: craig.cis_glbs.health_checks.retries,
              },
              {
                allow_insecure: craig.cis_glbs.health_checks.allow_insecure,
                follow_redirects: craig.cis_glbs.health_checks.follow_redirects,
              },
            ],
          },
        },
      ],
    },
    classic_gateways: {
      jsonField: "classic_gateways",
      groups: [
        {
          name: craig.classic_gateways.name,
          domain: craig.classic_gateways.domain,
          hadr: craig.classic_gateways.hadr,
        },
        {
          datacenter: craig.classic_gateways.datacenter,
          ssh_key: craig.classic_gateways.ssh_key,
          disk_key_names: craig.classic_gateways.disk_key_names,
        },
        {
          private_network_only: craig.classic_gateways.private_network_only,
          private_vlan: craig.classic_gateways.private_vlan,
          public_vlan: craig.classic_gateways.public_vlan,
        },
        {
          package_key_name: craig.classic_gateways.package_key_name,
          os_key_name: craig.classic_gateways.os_key_name,
          process_key_name: craig.classic_gateways.process_key_name,
        },
        {
          network_speed: craig.classic_gateways.network_speed,
          public_bandwidth: craig.classic_gateways.public_bandwidth,
          memory: craig.classic_gateways.memory,
        },
        {
          tcp_monitoring: craig.classic_gateways.tcp_monitoring,
          redundant_network: craig.classic_gateways.redundant_network,
          ipv6_enabled: craig.classic_gateways.ipv6_enabled,
        },
      ],
    },
    classic_ssh_keys: {
      groups: [
        {
          name: craig.classic_ssh_keys.name,
        },
        {
          public_key: craig.classic_ssh_keys.public_key,
        },
      ],
    },
    classic_vlans: {
      groups: [
        {
          name: craig.classic_vlans.name,
          datacenter: craig.classic_vlans.datacenter,
        },
        {
          type: craig.classic_vlans.type,
          router_hostname: craig.classic_vlans.router_hostname,
        },
      ],
    },
    fortigate_vnf: {
      groups: [
        {
          name: craig.fortigate_vnf.name,
          resource_group: craig.fortigate_vnf.resource_group,
          vpc: craig.fortigate_vnf.vpc,
        },
        {
          profile: craig.fortigate_vnf.profile,
          ssh_keys: craig.fortigate_vnf.ssh_keys,
          security_groups: craig.fortigate_vnf.security_groups,
        },
        {
          primary_subnet: craig.fortigate_vnf.primary_subnet,
          secondary_subnet: craig.fortigate_vnf.secondary_subnet,
        },
      ],
    },
    icd: {
      groups: [
        {
          use_data: craig.icd.use_data,
          name: craig.icd.name,
          service: craig.icd.service,
        },
        {
          resource_group: craig.icd.resource_group,
          plan: craig.icd.plan,
          group_id: craig.icd.group_id,
        },
        {
          memory: craig.icd.memory,
          disk: craig.icd.disk,
          cpu: craig.icd.cpu,
        },
        {
          encryption_key: craig.icd.encryption_key,
        },
      ],
    },
    clusters: {
      jsonField: "clusters",
      groups: [
        {
          name: craig.clusters.name,
          resource_group: craig.clusters.resource_group,
          kube_type: craig.clusters.kube_type,
        },
        {
          flavor: craig.clusters.flavor,
          cos: craig.clusters.cos,
          entitlement: craig.clusters.entitlement,
        },
        {
          vpc: craig.clusters.vpc,
          subnets: craig.clusters.subnets,
          workers_per_subnet: craig.clusters.workers_per_subnet,
        },
        {
          kube_version: craig.clusters.kube_version,
          update_all_workers: craig.clusters.update_all_workers,
        },
        {
          encryption_key: craig.clusters.encryption_key,
          private_endpoint: craig.clusters.private_endpoint,
        },
      ],
      subForms: [
        {
          name: "Worker Pools",
          jsonField: "worker_pools",
          addText: "Create a Worker Pool",
          form: {
            groups: [
              {
                name: craig.clusters.worker_pools.name,
                entitlement: craig.clusters.worker_pools.entitlement,
                flavor: craig.clusters.worker_pools.flavor,
              },
              {
                subnets: craig.clusters.worker_pools.subnets,
                workers_per_subnet:
                  craig.clusters.worker_pools.workers_per_subnet,
              },
            ],
          },
        },
        {
          name: "Opaque Secrets",
          jsonField: "opaque_secrets",
          addText: "Create an Opaque Secret",
          form: {
            groups: [
              {
                name: craig.clusters.opaque_secrets.name,
                namespace: craig.clusters.opaque_secrets.namespace,
                persistence: craig.clusters.opaque_secrets.persistence,
              },
              {
                secrets_manager: craig.clusters.opaque_secrets.secrets_manager,
                secrets_group: craig.clusters.opaque_secrets.secrets_group,
                expiration_date: craig.clusters.opaque_secrets.expiration_date,
              },
              {
                labels: craig.clusters.opaque_secrets.labels,
              },
              {
                heading: {
                  type: "subHeading",
                  name: "Arbitrary Secret",
                },
              },
              {
                arbitrary_secret_name:
                  craig.clusters.opaque_secrets.arbitrary_secret_name,
                arbitrary_secret_description:
                  craig.clusters.opaque_secrets.arbitrary_secret_description,
              },
              {
                arbitrary_secret_data:
                  craig.clusters.opaque_secrets.arbitrary_secret_data,
              },
              {
                heading: {
                  type: "subHeading",
                  name: "Username Password Secret",
                },
              },
              {
                username_password_secret_name:
                  craig.clusters.opaque_secrets.username_password_secret_name,
                username_password_secret_description:
                  craig.clusters.opaque_secrets
                    .username_password_secret_description,
              },
              {
                username_password_secret_username:
                  craig.clusters.opaque_secrets
                    .username_password_secret_username,
                username_password_secret_password:
                  craig.clusters.opaque_secrets
                    .username_password_secret_password,
              },
              {
                auto_rotate: craig.clusters.opaque_secrets.auto_rotate,
              },
              {
                interval: craig.clusters.opaque_secrets.interval,
                unit: craig.clusters.opaque_secrets.unit,
              },
            ],
          },
        },
      ],
    },
    dns: {
      jsonField: "dns",
      groups: [
        {
          name: craig.dns.name,
          resource_group: craig.dns.resource_group,
          plan: craig.dns.plan,
        },
      ],
      subForms: [
        {
          name: "Zones",
          addText: "Create a DNS Zone",
          jsonField: "zones",
          form: {
            groups: [
              {
                name: craig.dns.zones.name,
                label: craig.dns.zones.label,
                vpcs: craig.dns.zones.vpcs,
              },
              {
                description: craig.dns.zones.description,
              },
            ],
          },
        },
        {
          name: "Records",
          addText: "Create a DNS Record",
          jsonField: "records",
          form: {
            groups: [
              {
                use_vsi: craig.dns.records.use_vsi,
                vpc: craig.dns.records.vpc,
                vsi: craig.dns.records.vsi,
              },
              {
                name: craig.dns.records.name,
                dns_zone: craig.dns.records.dns_zone,
                ttl: craig.dns.records.ttl,
              },
              {
                rdata: craig.dns.records.rdata,
                type: craig.dns.records.type,
                preference: craig.dns.records.preference,
                port: craig.dns.records.port,
              },
              {
                hideWhen: craig.dns.records.priority.hideWhen,
                protocol: craig.dns.records.protocol,
                priority: craig.dns.records.priority,
                weight: craig.dns.records.weight,
              },
              {
                hideWhen: craig.dns.records.service.hideWhen,
                service: craig.dns.records.service,
              },
            ],
          },
        },
        {
          name: "Custom Resolvers",
          addText: "Create a Custom Resolver",
          jsonField: "custom_resolvers",
          form: {
            groups: [
              {
                name: craig.dns.custom_resolvers.name,
                vpc: craig.dns.custom_resolvers.vpc,
                subnets: craig.dns.custom_resolvers.subnets,
              },
              {
                description: craig.dns.custom_resolvers.description,
              },
            ],
          },
        },
      ],
    },
    event_streams: {
      jsonField: "event_streams",
      groups: [
        {
          name: craig.event_streams.name,
          plan: craig.event_streams.plan,
          resource_group: craig.event_streams.resource_group,
        },
        {
          throughput: craig.event_streams.throughput,
          storage_size: craig.event_streams.storage_size,
        },
        {
          private_ip_allowlist: craig.event_streams.private_ip_allowlist,
        },
      ],
    },
    key_management: {
      jsonField: "key_management",
      groups: [
        {
          use_hs_crypto: craig.key_management.use_hs_crypto,
          use_data: craig.key_management.use_data,
        },
        {
          name: craig.key_management.name,
          authorize_vpc_reader_role:
            craig.key_management.authorize_vpc_reader_role,
        },
        {
          resource_group: craig.key_management.resource_group,
        },
      ],
      subForms: [
        {
          jsonField: "keys",
          name: "Encryption Keys",
          addText: "Create an Encryption Key",
          form: {
            groups: [
              {
                name: craig.key_management.keys.name,
                key_ring: craig.key_management.keys.key_ring,
              },
              {
                force_delete: craig.key_management.keys.force_delete,
                dual_auth_delete: craig.key_management.keys.dual_auth_delete,
              },
              {
                root_key: craig.key_management.keys.root_key,
                rotation: craig.key_management.keys.rotation,
              },
              {
                endpoint: craig.key_management.keys.endpoint,
              },
            ],
          },
        },
      ],
    },
    load_balancers: {
      jsonField: "load_balancers",
      groups: [
        {
          heading: {
            name: "Load Balancer",
            type: "subHeading",
          },
        },
        {
          name: craig.load_balancers.name,
          resource_group: craig.load_balancers.resource_group,
          type: craig.load_balancers.type,
        },
        {
          vpc: craig.load_balancers.vpc,
          security_groups: craig.load_balancers.security_groups,
        },
        {
          heading: {
            name: "Load Balancer VSI",
            type: "subHeading",
          },
        },
        {
          target_vsi: craig.load_balancers.target_vsi,
          port: craig.load_balancers.port,
        },
        {
          vsi_tiles: true,
        },
        {
          heading: {
            name: "Load Balancer Pool",
            type: "subHeading",
          },
        },
        {
          algorithm: craig.load_balancers.algorithm,
          protocol: craig.load_balancers.protocol,
          health_type: craig.load_balancers.health_type,
        },
        {
          health_timeout: craig.load_balancers.health_timeout,
          health_delay: craig.load_balancers.health_delay,
          health_retries: craig.load_balancers.health_retries,
        },
        {
          heading: {
            name: "Load Balancer Listener",
            type: "subHeading",
          },
        },
        {
          listener_port: craig.load_balancers.listener_port,
          listener_protocol: craig.load_balancers.listener_protocol,
          connection_limit: craig.load_balancers.connection_limit,
        },
        {
          heading: {
            name: "(Optional) Pool Customization",
            type: "subHeading",
          },
        },
        {
          proxy_protocol: craig.load_balancers.proxy_protocol,
          session_persistence_type:
            craig.load_balancers.session_persistence_type,
          session_persistence_app_cookie_name:
            craig.load_balancers.session_persistence_app_cookie_name,
        },
      ],
    },
    logdna: {
      groups: [
        {
          enabled: craig.logdna.enabled,
        },
        {
          name: craig.logdna.name,
          plan: craig.logdna.plan,
          resource_group: craig.logdna.resource_group,
        },
        {
          bucket: craig.logdna.bucket,
          archive: craig.logdna.archive,
          platform_logs: craig.logdna.platform_logs,
        },
      ],
    },
    object_storage: {
      jsonField: "object_storage",
      groups: [
        {
          use_data: craig.object_storage.use_data,
          use_random_suffix: craig.object_storage.use_random_suffix,
        },
        {
          name: craig.object_storage.name,
          resource_group: craig.object_storage.resource_group,
        },
        {
          plan: craig.object_storage.plan,
          kms: craig.object_storage.kms,
        },
      ],
      subForms: [
        {
          name: "Service Credentials",
          jsonField: "keys",
          addText: "Create a Service Credential",
          tooltip: {
            content:
              "A service credential allows for a service instance to connect to Object Storage.",
            link: "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-service-credentials",
          },
          form: {
            groups: [
              {
                name: craig.object_storage.keys.name,
                role: craig.object_storage.keys.role,
              },
              {
                enable_hmac: craig.object_storage.keys.enable_hmac,
              },
            ],
          },
        },
        {
          name: "Buckets",
          jsonField: "buckets",
          addText: "Create a Bucket",
          form: {
            groups: [
              {
                name: craig.object_storage.buckets.name,
                storage_class: craig.object_storage.buckets.storage_class,
              },
              {
                kms_key: craig.object_storage.buckets.kms_key,
                force_delete: craig.object_storage.buckets.force_delete,
              },
            ],
          },
        },
      ],
    },
    power: {
      jsonField: "power",
      setDefault: {
        images: [],
        ssh_keys: [],
      },
      groups: [
        {
          use_data: craig.power.use_data,
        },
        {
          name: craig.power.name,
          zone: craig.power.zone,
        },
        {
          resource_group: craig.power.resource_group,
          imageNames: craig.power.imageNames,
        },
      ],
      subForms: [
        {
          name: "SSH Keys",
          addText: "Create an SSH Key",
          jsonField: "ssh_keys",
          form: {
            groups: [
              {
                use_data: craig.power.ssh_keys.use_data,
                name: craig.power.ssh_keys.name,
              },
              {
                public_key: craig.power.ssh_keys.public_key,
              },
            ],
          },
        },
        {
          name: "Power VS Subnets",
          addText: "Create a Subnet",
          jsonField: "network",
          form: {
            groups: [
              {
                name: craig.power.network.name,
                use_data: craig.power.network.use_data,
              },
              {
                pi_network_type: craig.power.network.pi_network_type,
                pi_cidr: craig.power.network.pi_cidr,
              },
              {
                pi_dns: craig.power.network.pi_dns,
                pi_network_jumbo: craig.power.network.pi_network_jumbo,
              },
            ],
          },
        },
        {
          name: "Cloud Connections",
          addText: "Create a Cloud connection",
          jsonField: "cloud_connections",
          form: {
            groups: [
              {
                name: craig.power.cloud_connections.name,
                pi_cloud_connection_speed:
                  craig.power.cloud_connections.pi_cloud_connection_speed,
              },
              {
                pi_cloud_connection_global_routing:
                  craig.power.cloud_connections
                    .pi_cloud_connection_global_routing,
                pi_cloud_connection_metered:
                  craig.power.cloud_connections.pi_cloud_connection_metered,
              },
              {
                pi_cloud_connection_transit_enabled:
                  craig.power.cloud_connections
                    .pi_cloud_connection_transit_enabled,
                transit_gateways:
                  craig.power.cloud_connections.transit_gateways,
              },
            ],
          },
        },
        {
          toggleFormFieldName: "network",
          name: "Network Connections",
          hideWhen: function (stateData, componentProps) {
            return (
              contains(edgeRouterEnabledZones, componentProps.data.zone) ||
              componentProps.data.cloud_connections.length === 0
            );
          },
          hideFormTitleButton: function () {
            return true;
          },
          jsonField: "attachments",
          noDeleteButton: true,
          form: {
            groups: [
              {
                connections: craig.power.attachments.connections,
              },
            ],
          },
        },
      ],
    },
    power_instances: {
      jsonField: "power_instances",
      setDefault: {},
      groups: [
        {
          sap: craig.power_instances.sap,
          sap_profile: craig.power_instances.sap_profile,
        },
        {
          name: craig.power_instances.name,
          workspace: craig.power_instances.workspace,
          network: craig.power_instances.network,
        },
        {
          ssh_key: craig.power_instances.ssh_key,
          image: craig.power_instances.image,
          pi_sys_type: craig.power_instances.pi_sys_type,
        },
        {
          pi_proc_type: craig.power_instances.pi_proc_type,
          pi_processors: craig.power_instances.pi_processors,
          pi_memory: craig.power_instances.pi_memory,
        },
        {
          pi_storage_pool_affinity:
            craig.power_instances.pi_storage_pool_affinity,
        },
        {
          heading: {
            name: "Boot Volume",
            type: "subHeading",
          },
        },
        {
          storage_option: craig.power_instances.storage_option,
          pi_storage_type: craig.power_instances.pi_storage_type,
          pi_storage_pool: craig.power_instances.pi_storage_pool,
          affinity_type: craig.power_instances.affinity_type,
          pi_affinity_volume: craig.power_instances.pi_affinity_volume,
          pi_anti_affinity_volume:
            craig.power_instances.pi_anti_affinity_volume,
          pi_anti_affinity_instance:
            craig.power_instances.pi_anti_affinity_instance,
          pi_affinity_instance: craig.power_instances.pi_affinity_instance,
        },
        {
          pi_user_data: craig.power_instances.pi_user_data,
        },
        {
          heading: {
            name: "IP Interface Options",
            type: "subHeading",
          },
        },
      ],
    },
    power_volumes: {
      groups: [
        {
          name: craig.power_volumes.name,
          workspace: craig.power_volumes.workspace,
          pi_volume_size: craig.power_volumes.pi_volume_size,
        },
        {
          storage_option: craig.power_volumes.storage_option,
          pi_volume_type: craig.power_volumes.pi_volume_type,
          pi_volume_pool: craig.power_volumes.pi_volume_pool,
          affinity_type: craig.power_volumes.affinity_type,
          pi_affinity_volume: craig.power_volumes.pi_affinity_volume,
          pi_anti_affinity_volume: craig.power_volumes.pi_anti_affinity_volume,
          pi_anti_affinity_instance:
            craig.power_volumes.pi_anti_affinity_instance,
          pi_affinity_instance: craig.power_volumes.pi_affinity_instance,
        },
        {
          pi_replication_enabled: craig.power_volumes.pi_replication_enabled,
          pi_volume_shareable: craig.power_volumes.pi_volume_shareable,
          attachments: craig.power_volumes.attachments,
        },
        {
          count: craig.power_volumes.count,
        },
      ],
    },
    resource_groups: {
      jsonField: "resource_groups",
      groups: [
        {
          use_data: craig.resource_groups.use_data,
        },
        {
          name: craig.resource_groups.name,
          use_prefix: craig.resource_groups.use_prefix,
        },
      ],
    },
    routing_tables: {
      jsonField: "routing_tables",
      groups: [
        {
          name: craig.routing_tables.name,
          vpc: craig.routing_tables.vpc,
        },
        {
          route_direct_link_ingress:
            craig.routing_tables.route_direct_link_ingress,
          internet_ingress: craig.routing_tables.internet_ingress,
        },
        {
          transit_gateway_ingress: craig.routing_tables.transit_gateway_ingress,
          route_vpc_zone_ingress: craig.routing_tables.route_vpc_zone_ingress,
        },
        {
          accept_routes_from_resource_type:
            craig.routing_tables.accept_routes_from_resource_type,
        },
      ],
      subForms: [
        {
          name: "Routes",
          jsonField: "routes",
          addText: "Create a Route",
          form: {
            groups: [
              {
                name: craig.routing_tables.routes.name,
                zone: craig.routing_tables.routes.zone,
                destination: craig.routing_tables.routes.destination,
              },
              {
                action: craig.routing_tables.routes.action,
                next_hop: craig.routing_tables.routes.next_hop,
              },
            ],
          },
        },
      ],
    },
    secrets_manager: {
      jsonField: "secrets_manager",
      groups: [
        {
          use_data: craig.secrets_manager.use_data,
        },
        {
          name: craig.secrets_manager.name,
          resource_group: craig.secrets_manager.resource_group,
          encryption_key: craig.secrets_manager.encryption_key,
        },
      ],
    },
    scc_v2: {
      jsonField: "scc_v2",
      disableSave: disableSave,
      groups: [
        {
          name: craig.scc_v2.name,
          region: craig.scc_v2.region,
          resource_group: craig.scc_v2.resource_group,
        },
      ],
      subForms: [
        {
          name: "Profile Attachments",
          jsonField: "profile_attachments",
          addText: "Create a Profile Attachment",
          hideWhen: function (stateData, componentProps) {
            return componentProps.craig.store.json.scc_v2.enable === false;
          },
          form: {
            groups: [
              {
                name: craig.scc_v2.profile_attachments.name,
                profile: craig.scc_v2.profile_attachments.profile,
              },
              {
                schedule: craig.scc_v2.profile_attachments.schedule,
              },
            ],
          },
        },
      ],
    },
    ssh_keys: {
      groups: [
        {
          use_data: craig.ssh_keys.use_data,
        },
        {
          name: craig.ssh_keys.name,
          resource_group: craig.ssh_keys.resource_group,
        },
        {
          public_key: craig.ssh_keys.public_key,
        },
      ],
    },
    sysdig: {
      groups: [
        {
          enabled: craig.sysdig.enabled,
        },
        {
          name: craig.sysdig.name,
          resource_group: craig.sysdig.resource_group,
        },
        {
          plan: craig.sysdig.plan,
          platform_logs: craig.sysdig.platform_logs,
        },
      ],
    },
    transit_gateways: {
      jsonField: "transit_gateways",
      setDefault: {
        connections: [],
      },
      groups: [
        {
          use_data: craig.transit_gateways.use_data,
        },
        {
          name: craig.transit_gateways.name,
          resource_group: craig.transit_gateways.resource_group,
        },
        {
          hideWhen: function (stateData) {
            return stateData.use_data;
          },
          global: craig.transit_gateways.global,
        },
        {
          heading: {
            name: "Connections",
            type: "subHeading",
          },
        },
        {
          vpc_connections: craig.transit_gateways.vpc_connections,
          power_connections: craig.transit_gateways.power_connections,
        },
        // the patterns where existing infrastructure exists are more likely
        // to import a transit gateway than a vpc CRN. JSON-to-IaC for CRNs
        // is still supported, but will not be displayed. If we have a request
        // for that functionality, we should implement
      ],
      subForms: [
        {
          name: "GRE Tunnels",
          addText: "Create a GRE Tunnel",
          jsonField: "gre_tunnels",
          toggleFormFieldName: "gateway",
          hideFormTitleButton: function (stateData, componentProps) {
            return (
              !componentProps.craig.store.json._options.enable_classic ||
              componentProps.craig.store.json.classic_gateways.length === 0
            );
          },
          form: {
            groups: [
              {
                gateway: craig.transit_gateways.gre_tunnels.gateway,
                zone: craig.transit_gateways.gre_tunnels.zone,
              },
              {
                local_tunnel_ip:
                  craig.transit_gateways.gre_tunnels.local_tunnel_ip,
                remote_tunnel_ip:
                  craig.transit_gateways.gre_tunnels.remote_tunnel_ip,
              },
              {
                remote_bgp_asn:
                  craig.transit_gateways.gre_tunnels.remote_bgp_asn,
              },
            ],
          },
        },
        {
          name: "Prefix Filters",
          addText: "Create a Prefix Filter",
          jsonField: "prefix_filters",
          form: {
            groups: [
              {
                name: craig.transit_gateways.prefix_filters.name,
              },
              {
                connection_type:
                  craig.transit_gateways.prefix_filters.connection_type,
                target: craig.transit_gateways.prefix_filters.target,
              },
              {
                action: craig.transit_gateways.prefix_filters.action,
                prefix: craig.transit_gateways.prefix_filters.prefix,
              },
              {
                le: craig.transit_gateways.prefix_filters.le,
                ge: craig.transit_gateways.prefix_filters.ge,
              },
            ],
          },
        },
      ],
    },
    virtual_private_endpoints: {
      jsonField: "virtual_private_endpoints",
      groups: [
        {
          name: craig.virtual_private_endpoints.name,
          vpc: craig.virtual_private_endpoints.vpc,
          service: craig.virtual_private_endpoints.service,
        },
        {
          resource_group: craig.virtual_private_endpoints.resource_group,
          security_groups: craig.virtual_private_endpoints.security_groups,
          subnets: craig.virtual_private_endpoints.subnets,
        },
        {
          instance: craig.virtual_private_endpoints.instance,
        },
      ],
    },
    vpcs: {
      setDefault: {
        public_gateways: [],
        publicGateways: [],
      },
      groups: [
        {
          name: craig.vpcs.name,
          resource_group: craig.vpcs.resource_group,
          bucket: craig.vpcs.bucket,
        },
        {
          default_network_acl_name: craig.vpcs.default_network_acl_name,
          default_security_group_name: craig.vpcs.default_security_group_name,
          default_routing_table_name: craig.vpcs.default_routing_table_name,
        },
        {
          heading: {
            name: "Public Gateways",
            type: "subHeading",
            tooltip: {
              content:
                "Public Gateways allow for all resources in a zone to communicate with the public internet. " +
                "Public Gateways are not needed for subnets where a VPN gateway is created.",
            },
          },
        },
        {
          pgw_zone_1: craig.vpcs.pgw_zone_1,
          pgw_zone_2: craig.vpcs.pgw_zone_2,
          pgw_zone_3: craig.vpcs.pgw_zone_3,
        },
        {
          heading: {
            name: "Classic Access",
            type: "subHeading",
          },
        },
        {
          classic_access: craig.vpcs.classic_access,
        },
      ],
    },
    vpn_gateways: {
      jsonField: "vpn_gateways",
      groups: [
        {
          name: craig.vpn_gateways.name,
          resource_group: craig.vpn_gateways.resource_group,
        },
        {
          vpc: craig.vpn_gateways.vpc,
          subnet: craig.vpn_gateways.subnet,
        },
        {
          policy_mode: craig.vpn_gateways.policy_mode,
        },
        {
          additional_prefixes: craig.vpn_gateways.additional_prefixes,
        },
      ],
      subForms: [
        {
          name: "Connections",
          addText: "Create a VPN Gateway Connection",
          jsonField: "connections",
          form: {
            groups: [
              {
                name: craig.vpn_gateways.connections.name,
                peer_address: craig.vpn_gateways.connections.peer_address,
              },
              {
                peer_cidrs: craig.vpn_gateways.connections.peer_cidrs,
              },
              {
                local_cidrs: craig.vpn_gateways.connections.local_cidrs,
              },
            ],
          },
        },
      ],
    },
    vpn_servers: {
      jsonField: "vpn_servers",
      groups: [
        {
          name: craig.vpn_servers.name,
          resource_group: craig.vpn_servers.resource_group,
          vpc: craig.vpn_servers.vpc,
        },
        {
          subnets: craig.vpn_servers.subnets,
          security_groups: craig.vpn_servers.security_groups,
          method: craig.vpn_servers.method,
        },
        {
          certificate_crn: craig.vpn_servers.certificate_crn,
          secrets_manager: craig.vpn_servers.secrets_manager,
          client_ca_crn: craig.vpn_servers.client_ca_crn,
          client_ip_pool: craig.vpn_servers.client_ip_pool,
        },
        {
          port: craig.vpn_servers.port,
          protocol: craig.vpn_servers.protocol,
        },
        {
          enable_split_tunneling: craig.vpn_servers.enable_split_tunneling,
          client_idle_timeout: craig.vpn_servers.client_idle_timeout,
        },
        {
          client_dns_server_ips: craig.vpn_servers.client_dns_server_ips,
        },
        {
          heading: {
            name: "Additional VPC Prefixes",
            type: "p",
          },
        },
        {
          zone: craig.vpn_servers.zone,
          additional_prefixes: craig.vpn_servers.additional_prefixes,
        },
      ],
      subForms: [
        {
          name: "Routes",
          addText: "Create a new Route",
          jsonField: "routes",
          form: {
            groups: [
              {
                name: craig.vpn_servers.routes.name,
                destination: craig.vpn_servers.routes.destination,
                action: craig.vpn_servers.routes.action,
              },
            ],
          },
        },
      ],
    },
    vsi: {
      jsonField: "vsi",
      groups: [
        {
          name: craig.vsi.name,
          resource_group: craig.vsi.resource_group,
        },
        {
          vpc: craig.vsi.vpc,
          subnets: craig.vsi.subnets,
          security_groups: craig.vsi.security_groups,
        },
        {
          vsi_per_subnet: craig.vsi.vsi_per_subnet,
          image_name: craig.vsi.image_name,
          profile: craig.vsi.profile,
        },
        {
          ssh_keys: craig.vsi.ssh_keys,
          encryption_key: craig.vsi.encryption_key,
        },
        {
          enable_floating_ip: craig.vsi.enable_floating_ip,
          primary_interface_ip_spoofing:
            craig.vsi.primary_interface_ip_spoofing,
        },
        {
          user_data: craig.vsi.user_data,
        },
      ],
      subForms: [
        {
          name: "Block Storage Volumes",
          addText: "Create a Block Storage Volume",
          jsonField: "volumes",
          form: {
            groups: [
              {
                name: craig.vsi.volumes.name,
                profile: craig.vsi.volumes.profile,
              },
              {
                encryption_key: craig.vsi.volumes.encryption_key,
                capacity: craig.vsi.volumes.capacity,
              },
            ],
          },
        },
      ],
    },
    vtl: {
      jsonField: "vtl",
      setDefault: {},
      groups: [
        {
          name: craig.vtl.name,
          workspace: craig.vtl.workspace,
          network: craig.vtl.network,
        },
        {
          ssh_key: craig.vtl.ssh_key,
          image: craig.vtl.image,
          pi_sys_type: craig.vtl.pi_sys_type,
        },
        {
          pi_proc_type: craig.vtl.pi_proc_type,
          pi_processors: craig.vtl.pi_processors,
          pi_memory: craig.vtl.pi_memory,
        },
        {
          pi_license_repository_capacity:
            craig.vtl.pi_license_repository_capacity,
          pi_storage_pool_affinity: craig.vtl.pi_storage_pool_affinity,
        },
        {
          heading: {
            name: "Boot Volume",
            type: "subHeading",
          },
        },
        {
          storage_option: craig.vtl.storage_option,
          pi_storage_type: craig.vtl.pi_storage_type,
          pi_storage_pool: craig.vtl.pi_storage_pool,
          affinity_type: craig.vtl.affinity_type,
          pi_affinity_volume: craig.vtl.pi_affinity_volume,
          pi_anti_affinity_volume: craig.vtl.pi_anti_affinity_volume,
          pi_anti_affinity_instance: craig.vtl.pi_anti_affinity_instance,
          pi_affinity_instance: craig.vtl.pi_affinity_instance,
        },
        {
          heading: {
            name: "IP Interface Options",
            type: "subHeading",
          },
        },
      ],
    },
    // not yet used by craig forms
    security_groups: {
      jsonField: "security_groups",
      groups: [
        {
          name: craig.security_groups.name,
          resource_group: craig.security_groups.resource_group,
          vpc: craig.security_groups.vpc,
        },
      ],
    },
  };
}

module.exports = {
  craigForms,
};
