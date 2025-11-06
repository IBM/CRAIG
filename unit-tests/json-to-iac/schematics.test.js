const { assert } = require("chai");
const { agentTf } = require("../../client/src/lib/json-to-iac/schematics");

it("should return correct agent terraform", () => {
  let actualData = agentTf({
    _options: {
      prefix: "schematics",
      region: "us-south",
      tags: ["hello", "world"],
      zones: 3,
      endpoints: "private",
      account_id: "",
      fs_cloud: true,
      enable_classic: false,
      dynamic_subnets: false,
      enable_power_vs: true,
      power_vs_zones: ["us-south"],
      craig_version: "1.8.0",
      template: "Power VS SAP Hana",
    },
    access_groups: [],
    agents: [
      {
        name: "schematics",
        cos: "schematics-cos",
        bucket: "schematics-bucket",
        bucket: "agent-bucket",
        vpc: "schematics-vpc",
        cluster: "schematics-agent-cluster",
        cluster_resource_group: "schematics-rg",
        resource_group: "schematics-rg",
        deploy: {
          name: "agent-deploy",
        },
        policy: {
          name: "agent-policy",
          resource_group: "schematics-rg",
        },
      },
    ],
    appid: [],
    atracker: {
      enabled: true,
      type: "cos",
      name: "atracker",
      target_name: "atracker-cos",
      bucket: "atracker-bucket",
      add_route: true,
      cos_key: "cos-bind-key",
      locations: ["global", "us-south"],
    },
    cbr_rules: [],
    cbr_zones: [],
    clusters: [],
    dns: [],
    event_streams: [],
    f5_vsi: [
      {
        kms: "kms",
        subnet: "f5-management-zone-1",
        vpc: "edge",
        resource_group: "edge-rg",
        ssh_keys: ["ssh-key"],
        security_groups: ["f5-management-sg"],
        encryption_key: "vsi-volume-key",
        profile: "cx2-4x8",
        name: "f5-zone-1",
        image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
        network_interfaces: [
          {
            security_groups: ["f5-bastion-sg"],
            subnet: "f5-bastion-zone-1",
          },
          {
            security_groups: ["f5-external-sg"],
            subnet: "f5-external-zone-1",
          },
        ],
        template: {
          hostname: "f5-ve-01",
          domain: "local",
          default_route_gateway_cidr: "10.10.10.10/24",
          zone: 1,
          vpc: "edge",
          do_declaration_url: "null",
          as3_declaration_url: "null",
          ts_declaration_url: "null",
          phone_home_url: "null",
          tgstandby_url: "null",
          tgrefresh_url: "null",
          tgactive_url: "null",
          template_version: "20210201",
          template_source:
            "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
          app_id: "null",
          license_type: "none",
          license_host: "null",
          license_username: "null",
          license_password: "null",
          license_pool: "null",
          license_sku_keyword_1: "null",
          license_sku_keyword_2: "null",
          tmos_admin_password: null,
        },
      },
      {
        kms: "kms",
        subnet: "f5-management-zone-2",
        vpc: "edge",
        resource_group: "edge-rg",
        ssh_keys: ["ssh-key"],
        security_groups: ["f5-management-sg"],
        encryption_key: "vsi-volume-key",
        profile: "cx2-4x8",
        name: "f5-zone-2",
        image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
        network_interfaces: [
          {
            security_groups: ["f5-bastion-sg"],
            subnet: "f5-bastion-zone-2",
          },
          {
            security_groups: ["f5-external-sg"],
            subnet: "f5-external-zone-2",
          },
        ],
        template: {
          hostname: "f5-ve-01",
          domain: "local",
          default_route_gateway_cidr: "10.10.10.10/24",
          zone: 2,
          vpc: "edge",
          do_declaration_url: "null",
          as3_declaration_url: "null",
          ts_declaration_url: "null",
          phone_home_url: "null",
          tgstandby_url: "null",
          tgrefresh_url: "null",
          tgactive_url: "null",
          template_version: "20210201",
          template_source:
            "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
          app_id: "null",
          license_type: "none",
          license_host: "null",
          license_username: "null",
          license_password: "null",
          license_pool: "null",
          license_sku_keyword_1: "null",
          license_sku_keyword_2: "null",
          tmos_admin_password: null,
        },
      },
      {
        kms: "kms",
        subnet: "f5-management-zone-3",
        vpc: "edge",
        resource_group: "edge-rg",
        ssh_keys: ["ssh-key"],
        security_groups: ["f5-management-sg"],
        encryption_key: "vsi-volume-key",
        profile: "cx2-4x8",
        name: "f5-zone-3",
        image: "f5-bigip-15-1-5-1-0-0-14-all-1slot",
        network_interfaces: [
          {
            security_groups: ["f5-bastion-sg"],
            subnet: "f5-bastion-zone-3",
          },
          {
            security_groups: ["f5-external-sg"],
            subnet: "f5-external-zone-3",
          },
        ],
        template: {
          hostname: "f5-ve-01",
          domain: "local",
          default_route_gateway_cidr: "10.10.10.10/24",
          zone: 3,
          vpc: "edge",
          do_declaration_url: "null",
          as3_declaration_url: "null",
          ts_declaration_url: "null",
          phone_home_url: "null",
          tgstandby_url: "null",
          tgrefresh_url: "null",
          tgactive_url: "null",
          template_version: "20210201",
          template_source:
            "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
          app_id: "null",
          license_type: "none",
          license_host: "null",
          license_username: "null",
          license_password: "null",
          license_pool: "null",
          license_sku_keyword_1: "null",
          license_sku_keyword_2: "null",
          tmos_admin_password: null,
        },
      },
    ],
    iam_account_settings: {
      enable: false,
      mfa: null,
      allowed_ip_addresses: null,
      include_history: false,
      if_match: null,
      max_sessions_per_identity: null,
      restrict_create_service_id: null,
      restrict_create_platform_apikey: null,
      session_expiration_in_seconds: null,
      session_invalidation_in_seconds: null,
    },
    icd: [],
    key_management: [
      {
        name: "kms",
        resource_group: "service-rg",
        use_hs_crypto: false,
        authorize_vpc_reader_role: true,
        use_data: false,
        keys: [
          {
            key_ring: "ring",
            name: "key",
            root_key: true,
            force_delete: true,
            endpoint: "public",
            rotation: 1,
            dual_auth_delete: false,
          },
          {
            key_ring: "ring",
            name: "atracker-key",
            root_key: true,
            force_delete: true,
            endpoint: "public",
            rotation: 1,
            dual_auth_delete: false,
          },
          {
            key_ring: "ring",
            name: "vsi-volume-key",
            root_key: true,
            force_delete: true,
            endpoint: "public",
            rotation: 1,
            dual_auth_delete: false,
          },
          {
            key_ring: "ring",
            name: "roks-key",
            root_key: true,
            force_delete: null,
            endpoint: null,
            rotation: 1,
            dual_auth_delete: false,
          },
        ],
      },
    ],
    load_balancers: [],
    logdna: {
      enabled: false,
      plan: "lite",
      endpoints: "private",
      platform_logs: false,
      resource_group: "service-rg",
      cos: "atracker-cos",
      bucket: "atracker-bucket",
    },
    object_storage: [
      {
        buckets: [
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "atracker-bucket",
            storage_class: "standard",
            use_random_suffix: true,
          },
        ],
        keys: [
          {
            name: "cos-bind-key",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ],
        name: "atracker-cos",
        plan: "standard",
        resource_group: "service-rg",
        use_data: false,
        use_random_suffix: true,
        kms: "kms",
      },
      {
        buckets: [
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "key",
            name: "management-bucket",
            storage_class: "standard",
            use_random_suffix: true,
          },
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "key",
            name: "workload-bucket",
            storage_class: "standard",
            use_random_suffix: true,
          },
          {
            force_delete: false,
            name: "edge-bucket",
            storage_class: "standard",
            kms_key: "key",
            endpoint: "public",
            use_random_suffix: true,
          },
        ],
        use_random_suffix: true,
        keys: [],
        name: "cos",
        plan: "standard",
        resource_group: "service-rg",
        use_data: false,
        kms: "kms",
      },
    ],
    power: [
      {
        name: "secure-powervs",
        resource_group: "powervs-rg",
        zone: "us-south",
        ssh_keys: [
          {
            name: "power-ssh-key",
            public_key:
              "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5Zx4PO/vXJ7ptTy84KuUcf7D4XKE20zErMHlnIefwcsGnfSacqqyGyZDpT/CedgtiHFNPBItzMYGpfqF9UZ2a0C3LfdWPt1JE4pHGHE2NoujGVhACSJKADFia6d2u6go1SP3aXmTFYlCWl/z6NJ2rq/Tz3jH5w3oc7QbS+awXzTz/Vw0AIgUJXVqCNWSy9kVnPwTI3dwBdc61ttfQzwAbJm0A2dduHex/Ztstx9pcPeFcULf/muVUjOeqJKCYqgJpO7TDEE4VEQQqj+qUrmWxP/7nMt1SAuxtX1Ey/8LPnu0WN43tVfEUSA58GrkT4YOLp5+N2jwVXd1twuOcyxkq9DM54JEyPe8JWTvgxPt24QzUWoAIPZ9zeLsdcC7DtgVzyR+6f2tmcEn+t/0XHxSOzkcOSRouuDdzEE7YOG9Co/zVLLEoWA7Qfz0ObuQ2ex8WRbTRSbDc7o2++VxPsh4zR9KKVRfzssCtLnRxoGHWTTBI/syUl8kQcy8TCNTDuHE= ay1man1@Aymans-MBP-WORK",
            use_data: false,
            resource_group: "powervs-rg",
            workspace: "secure-powervs",
            zone: "us-south",
          },
        ],
        network: [
          {
            name: "management",
            pi_network_type: "vlan",
            pi_cidr: "10.51.0.0/24",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "secure-powervs",
            zone: "us-south",
          },
          {
            name: "backup",
            pi_network_type: "vlan",
            pi_cidr: "10.52.0.0/24",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "secure-powervs",
            zone: "us-south",
            depends_on: [
              "${ibm_pi_network.power_network_secure_powervs_management}",
            ],
          },
          {
            name: "sap",
            pi_network_type: "vlan",
            pi_cidr: "10.53.0.0/24",
            pi_dns: ["127.0.0.1"],
            pi_network_jumbo: false,
            workspace: "secure-powervs",
            zone: "us-south",
            depends_on: [
              "${ibm_pi_network.power_network_secure_powervs_backup}",
            ],
          },
        ],
        cloud_connections: [],
        images: [
          {
            name: "RHEL8-SP4-SAP",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "3a1fd0fd-24df-44a1-919a-7041f9c74fc0",
          },
          {
            name: "RHEL8-SP4-SAP-NETWEAVER",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "a1e22955-749d-4b4a-aeba-d297d60fcb0b",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_rhel8_sp4_sap}",
            ],
          },
          {
            name: "RHEL8-SP6-SAP",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "268144b8-6223-48e4-a26e-bdc8f71f6c60",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_rhel8_sp4_sap_netweaver}",
            ],
          },
          {
            name: "RHEL8-SP6-SAP-NETWEAVER",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "658ba2a0-4add-40b9-a177-a28a856c26de",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_rhel8_sp6_sap}",
            ],
          },
          {
            name: "SLES15-SP2-SAP",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "5d548cc2-e813-4c09-beb5-8f22b094905d",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_rhel8_sp6_sap_netweaver}",
            ],
          },
          {
            name: "SLES15-SP2-SAP-NETWEAVER",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "52579206-7efd-43ae-8417-ce5acac95d31",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_sles15_sp2_sap}",
            ],
          },
          {
            name: "SLES15-SP3-SAP",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "423bc6f6-bb0d-44c2-ad26-8705ae83f5ca",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_sles15_sp2_sap_netweaver}",
            ],
          },
          {
            name: "SLES15-SP3-SAP-NETWEAVER",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "1a62ac4a-83e7-4dee-a36f-983521f1826c",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_sles15_sp3_sap}",
            ],
          },
          {
            name: "SLES15-SP4-SAP",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "a6b8f8d5-86e0-4fb2-b335-2ce3f1a88612",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_sles15_sp3_sap_netweaver}",
            ],
          },
          {
            name: "SLES15-SP4-SAP-NETWEAVER",
            workspace: "secure-powervs",
            zone: "us-south",
            pi_image_id: "071e1eac-8aa2-4259-9c0e-5ec268f610e2",
            depends_on: [
              "${ibm_pi_image.power_image_secure_powervs_sles15_sp4_sap}",
            ],
          },
        ],
        attachments: [
          {
            network: "management",
            workspace: "secure-powervs",
            zone: "us-south",
            connections: [],
          },
          {
            network: "backup",
            workspace: "secure-powervs",
            zone: "us-south",
            connections: [],
          },
          {
            network: "sap",
            workspace: "secure-powervs",
            zone: "us-south",
            connections: [],
          },
        ],
        imageNames: [
          "RHEL8-SP4-SAP",
          "RHEL8-SP4-SAP-NETWEAVER",
          "RHEL8-SP6-SAP",
          "RHEL8-SP6-SAP-NETWEAVER",
          "SLES15-SP2-SAP",
          "SLES15-SP2-SAP-NETWEAVER",
          "SLES15-SP3-SAP",
          "SLES15-SP3-SAP-NETWEAVER",
          "SLES15-SP4-SAP",
          "SLES15-SP4-SAP-NETWEAVER",
        ],
      },
    ],
    power_instances: [
      {
        name: "secure-file-share",
        workspace: "secure-powervs",
        image: "RHEL8-SP4-SAP",
        network: [
          {
            name: "backup",
            ip_address: "",
          },
          {
            name: "management",
            ip_address: "",
          },
        ],
        zone: "us-south",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier1",
        ssh_key: "power-ssh-key",
        pi_sys_type: "s922",
        pi_memory: "2",
        pi_processors: ".5",
        storage_option: "Storage Type",
        pi_storage_pool_affinity: false,
        sap: false,
      },
      {
        name: "sap-hana",
        workspace: "secure-powervs",
        image: "RHEL8-SP6-SAP",
        network: [
          {
            name: "backup",
            ip_address: "",
          },
          {
            name: "management",
            ip_address: "",
          },
          {
            name: "sap",
            ip_address: "",
          },
        ],
        zone: "us-south",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier3",
        ssh_key: "power-ssh-key",
        pi_sys_type: "e880",
        pi_memory: "256",
        pi_processors: "4",
        pi_affinity_volume: null,
        pi_affinity_instance: null,
        pi_anti_affinity_instance: null,
        pi_anti_affinity_volume: null,
        storage_option: "Storage Type",
        pi_storage_pool_affinity: false,
        sap: true,
        sap_profile: "ush1-4x256",
      },
      {
        name: "sap-netweaver",
        workspace: "secure-powervs",
        image: "RHEL8-SP6-SAP-NETWEAVER",
        network: [
          {
            name: "backup",
            ip_address: "",
          },
          {
            name: "management",
            ip_address: "",
          },
          {
            name: "sap",
            ip_address: "",
          },
        ],
        zone: "us-south",
        pi_health_status: "OK",
        pi_proc_type: "shared",
        pi_storage_type: "tier3",
        ssh_key: "power-ssh-key",
        pi_sys_type: "e880",
        pi_processors: "3",
        pi_memory: "50",
        storage_option: "Storage Type",
        pi_storage_pool_affinity: false,
        sap: false,
      },
    ],
    power_volumes: [
      {
        name: "sapmnt",
        workspace: "secure-powervs",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier3",
        attachments: ["sap-hana", "sap-netweaver"],
        zone: "us-south",
        pi_volume_size: "300",
      },
      {
        name: "trans",
        workspace: "secure-powervs",
        pi_volume_shareable: true,
        pi_replication_enabled: false,
        pi_volume_type: "tier3",
        attachments: ["sap-hana", "sap-netweaver"],
        zone: "us-south",
        pi_volume_size: "50",
      },
      {
        name: "sap-hana-sap-data-1",
        mount: "/hana/data",
        pi_volume_size: 71,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-data-2",
        mount: "/hana/data",
        pi_volume_size: 71,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-data-3",
        mount: "/hana/data",
        pi_volume_size: 71,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-data-4",
        mount: "/hana/data",
        pi_volume_size: 71,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-log-1",
        mount: "/hana/log",
        pi_volume_size: 33,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-log-2",
        mount: "/hana/log",
        pi_volume_size: 33,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-log-3",
        mount: "/hana/log",
        pi_volume_size: 33,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-log-4",
        mount: "/hana/log",
        pi_volume_size: 33,
        pi_volume_type: "tier1",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
      {
        name: "sap-hana-sap-shared",
        mount: "/hana/shared",
        pi_volume_size: 256,
        pi_volume_type: "tier3",
        workspace: "secure-powervs",
        sap: true,
        attachments: ["sap-hana"],
        zone: "us-south",
        storage_option: "Storage Type",
        affinity_type: null,
      },
    ],
    resource_groups: [
      {
        use_prefix: true,
        name: "service-rg",
        use_data: false,
      },
      {
        use_prefix: true,
        name: "management-rg",
        use_data: false,
      },
      {
        use_prefix: true,
        name: "workload-rg",
        use_data: false,
      },
      {
        use_data: false,
        use_prefix: true,
        name: "edge-rg",
      },
      {
        use_data: false,
        name: "powervs-rg",
        use_prefix: true,
      },
    ],
    routing_tables: [],
    scc: {
      credential_description: null,
      id: null,
      passphrase: null,
      name: "",
      location: "us",
      collector_description: null,
      is_public: false,
      scope_description: null,
      enable: false,
    },
    secrets_manager: [],
    security_groups: [
      {
        name: "f5-management-sg",
        resource_group: "edge-rg",
        rules: [
          {
            sg: "f5-management-sg",
            vpc: "edge",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-management-sg",
            vpc: "edge",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-management-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-management-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-management-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-management-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
        ],
        vpc: "edge",
      },
      {
        name: "f5-external-sg",
        resource_group: "edge-rg",
        rules: [
          {
            sg: "f5-external-sg",
            vpc: "edge",
            direction: "inbound",
            name: "allow-inbound-443",
            source: "0.0.0.0/0",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
        ],
        vpc: "edge",
      },
      {
        name: "f5-bastion-sg",
        resource_group: "edge-rg",
        rules: [
          {
            sg: "f5-bastion-sg",
            vpc: "edge",
            direction: "inbound",
            name: "1-inbound-3023",
            source: "10.5.80.0/24",
            tcp: {
              port_max: 3025,
              port_min: 3023,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-bastion-sg",
            vpc: "edge",
            direction: "inbound",
            name: "1-inbound-3080",
            source: "10.5.80.0/24",
            tcp: {
              port_max: 3080,
              port_min: 3080,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-bastion-sg",
            vpc: "edge",
            direction: "inbound",
            name: "2-inbound-3023",
            source: "10.6.80.0/24",
            tcp: {
              port_max: 3025,
              port_min: 3023,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-bastion-sg",
            vpc: "edge",
            direction: "inbound",
            name: "2-inbound-3080",
            source: "10.6.80.0/24",
            tcp: {
              port_max: 3080,
              port_min: 3080,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-bastion-sg",
            vpc: "edge",
            direction: "inbound",
            name: "3-inbound-3023",
            source: "10.7.80.0/24",
            tcp: {
              port_max: 3025,
              port_min: 3023,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "f5-bastion-sg",
            vpc: "edge",
            direction: "inbound",
            name: "3-inbound-3080",
            source: "10.7.80.0/24",
            tcp: {
              port_max: 3080,
              port_min: 3080,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
        ],
        vpc: "edge",
      },
      {
        name: "edge-vpe-sg",
        resource_group: "edge-rg",
        rules: [
          {
            sg: "edge-vpe-sg",
            vpc: "edge",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "edge-vpe-sg",
            vpc: "edge",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "edge-vpe-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "edge-vpe-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "edge-vpe-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
          {
            sg: "edge-vpe-sg",
            vpc: "edge",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            icmp: {
              code: null,
              type: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
          },
        ],
        vpc: "edge",
      },
      {
        vpc: "management",
        name: "management-vpe",
        resource_group: "management-rg",
        rules: [
          {
            vpc: "management",
            sg: "management-vpe",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vpe",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
        ],
      },
      {
        vpc: "workload",
        name: "workload-vpe",
        resource_group: "workload-rg",
        rules: [
          {
            vpc: "workload",
            sg: "workload-vpe",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "workload",
            sg: "workload-vpe",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
        ],
      },
      {
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
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vsi",
            direction: "inbound",
            name: "allow-vpc-inbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vsi",
            direction: "outbound",
            name: "allow-vpc-outbound",
            source: "10.0.0.0/8",
            tcp: {
              port_max: null,
              port_min: null,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vsi",
            direction: "outbound",
            name: "allow-ibm-tcp-53-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 53,
              port_min: 53,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vsi",
            direction: "outbound",
            name: "allow-ibm-tcp-80-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 80,
              port_min: 80,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          {
            vpc: "management",
            sg: "management-vsi",
            direction: "outbound",
            name: "allow-ibm-tcp-443-outbound",
            source: "161.26.0.0/16",
            tcp: {
              port_max: 443,
              port_min: 443,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
        ],
      },
    ],
    ssh_keys: [
      {
        name: "ssh-key",
        public_key:
          "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5Zx4PO/vXJ7ptTy84KuUcf7D4XKE20zErMHlnIefwcsGnfSacqqyGyZDpT/CedgtiHFNPBItzMYGpfqF9UZ2a0C3LfdWPt1JE4pHGHE2NoujGVhACSJKADFia6d2u6go1SP3aXmTFYlCWl/z6NJ2rq/Tz3jH5w3oc7QbS+awXzTz/Vw0AIgUJXVqCNWSy9kVnPwTI3dwBdc61ttfQzwAbJm0A2dduHex/Ztstx9pcPeFcULf/muVUjOeqJKCYqgJpO7TDEE4VEQQqj+qUrmWxP/7nMt1SAuxtX1Ey/8LPnu0WN43tVfEUSA58GrkT4YOLp5+N2jwVXd1twuOcyxkq9DM54JEyPe8JWTvgxPt24QzUWoAIPZ9zeLsdcC7DtgVzyR+6f2tmcEn+t/0XHxSOzkcOSRouuDdzEE7YOG9Co/zVLLEoWA7Qfz0ObuQ2ex8WRbTRSbDc7o2++VxPsh4zR9KKVRfzssCtLnRxoGHWTTBI/syUl8kQcy8TCNTDuHE= ay1man1@Aymans-MBP-WORK",
        resource_group: "management-rg",
        use_data: false,
      },
    ],
    sysdig: {
      enabled: false,
      plan: "graduated-tier",
      resource_group: "service-rg",
    },
    teleport_vsi: [],
    transit_gateways: [
      {
        name: "transit-gateway",
        resource_group: "service-rg",
        global: false,
        connections: [
          {
            tgw: "transit-gateway",
            vpc: "management",
          },
          {
            tgw: "transit-gateway",
            vpc: "workload",
          },
        ],
      },
    ],
    virtual_private_endpoints: [
      {
        name: "management-cos",
        service: "cos",
        vpc: "management",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
      },
      {
        name: "workload-cos",
        service: "cos",
        vpc: "workload",
        resource_group: "workload-rg",
        security_groups: ["workload-vpe"],
        subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
      },
    ],
    vpcs: [
      {
        cos: "cos",
        bucket: "edge-bucket",
        name: "edge",
        resource_group: "edge-rg",
        classic_access: false,
        manual_address_prefix_management: true,
        default_network_acl_name: null,
        default_routing_table_name: null,
        default_security_group_name: null,
        address_prefixes: [
          {
            vpc: "edge",
            zone: 1,
            cidr: "10.5.0.0/16",
            name: "edge-zone-1",
          },
          {
            vpc: "edge",
            zone: 2,
            cidr: "10.6.0.0/16",
            name: "edge-zone-2",
          },
          {
            vpc: "edge",
            zone: 3,
            cidr: "10.7.0.0/16",
            name: "edge-zone-3",
          },
        ],
        acls: [
          {
            name: "edge-acl",
            vpc: "edge",
            resource_group: "edge-rg",
            rules: [
              {
                acl: "edge-acl",
                vpc: "edge",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                tcp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "edge-acl",
                vpc: "edge",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                acl: "edge-acl",
                vpc: "edge",
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-all-network-outbound",
                source: "10.0.0.0/8",
                tcp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ],
          },
          {
            name: "f5-external-acl",
            vpc: "edge",
            resource_group: "edge-rg",
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                acl: "f5-external-acl",
                vpc: "edge",
                tcp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                acl: "f5-external-acl",
                vpc: "edge",
                tcp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-all-network-outbound",
                source: "10.0.0.0/8",
                acl: "f5-external-acl",
                vpc: "edge",
                tcp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-f5-external-443-inbound",
                source: "0.0.0.0/0",
                acl: "f5-external-acl",
                vpc: "edge",
                tcp: {
                  port_max: 443,
                  port_min: 443,
                  source_port_min: null,
                  source_port_max: null,
                },
                icmp: {
                  code: null,
                  type: null,
                },
                udp: {
                  port_max: null,
                  port_min: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ],
          },
        ],
        subnets: [
          {
            vpc: "edge",
            name: "f5-bastion-zone-1",
            zone: 1,
            resource_group: "edge-rg",
            cidr: "10.5.50.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-bastion-zone-2",
            zone: 2,
            resource_group: "edge-rg",
            cidr: "10.6.50.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-bastion-zone-3",
            zone: 3,
            resource_group: "edge-rg",
            cidr: "10.7.50.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-external-zone-1",
            zone: 1,
            resource_group: "edge-rg",
            cidr: "10.5.40.0/24",
            network_acl: "f5-external-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-external-zone-2",
            zone: 2,
            resource_group: "edge-rg",
            cidr: "10.6.40.0/24",
            network_acl: "f5-external-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-external-zone-3",
            zone: 3,
            resource_group: "edge-rg",
            cidr: "10.7.40.0/24",
            network_acl: "f5-external-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-management-zone-1",
            zone: 1,
            resource_group: "edge-rg",
            cidr: "10.5.30.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-management-zone-2",
            zone: 2,
            resource_group: "edge-rg",
            cidr: "10.6.30.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "f5-management-zone-3",
            zone: 3,
            resource_group: "edge-rg",
            cidr: "10.7.30.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpe-zone-1",
            zone: 1,
            resource_group: "edge-rg",
            cidr: "10.5.60.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpe-zone-2",
            zone: 2,
            resource_group: "edge-rg",
            cidr: "10.6.60.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpe-zone-3",
            zone: 3,
            resource_group: "edge-rg",
            cidr: "10.7.60.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpn-1-zone-1",
            zone: 1,
            resource_group: "edge-rg",
            cidr: "10.5.10.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpn-1-zone-2",
            zone: 2,
            resource_group: "edge-rg",
            cidr: "10.6.10.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpn-1-zone-3",
            zone: 3,
            resource_group: "edge-rg",
            cidr: "10.7.10.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpn-2-zone-1",
            zone: 1,
            resource_group: "edge-rg",
            cidr: "10.5.20.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpn-2-zone-2",
            zone: 2,
            resource_group: "edge-rg",
            cidr: "10.6.20.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
          {
            vpc: "edge",
            name: "vpn-2-zone-3",
            zone: 3,
            resource_group: "edge-rg",
            cidr: "10.7.20.0/24",
            network_acl: "edge-acl",
            public_gateway: false,
            has_prefix: true,
          },
        ],
        public_gateways: [],
        publicGateways: [],
      },
      {
        cos: "cos",
        bucket: "management-bucket",
        name: "management",
        resource_group: "management-rg",
        classic_access: false,
        manual_address_prefix_management: true,
        default_network_acl_name: null,
        default_security_group_name: null,
        default_routing_table_name: null,
        publicGateways: [],
        address_prefixes: [
          {
            name: "vsi-zone-1",
            cidr: "10.10.0.0/29",
            zone: 1,
            vpc: "management",
          },
          {
            name: "vpn-zone-1",
            cidr: "10.10.0.16/28",
            zone: 1,
            vpc: "management",
          },
          {
            name: "vsi-zone-2",
            cidr: "10.20.0.0/29",
            zone: 2,
            vpc: "management",
          },
          {
            name: "vsi-zone-3",
            cidr: "10.30.0.0/29",
            zone: 3,
            vpc: "management",
          },
          {
            name: "vpe-zone-1",
            cidr: "10.10.0.48/29",
            zone: 1,
            vpc: "management",
          },
          {
            name: "vpe-zone-2",
            cidr: "10.20.0.16/29",
            zone: 2,
            vpc: "management",
          },
          {
            name: "vpe-zone-3",
            cidr: "10.30.0.16/29",
            zone: 3,
            vpc: "management",
          },
        ],
        subnets: [
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.0/29",
            name: "vsi-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.16/28",
            name: "vpn-zone-1",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.0.0/29",
            name: "vsi-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.0.0/29",
            name: "vsi-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 1,
            cidr: "10.10.0.48/29",
            name: "vpe-zone-1",
            resource_group: "management-rg",
            network_acl: "management",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 2,
            cidr: "10.20.0.16/29",
            name: "vpe-zone-2",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "management",
            zone: 3,
            cidr: "10.30.0.16/29",
            name: "vpe-zone-3",
            network_acl: "management",
            resource_group: "management-rg",
            public_gateway: false,
            has_prefix: false,
          },
        ],
        public_gateways: [],
        acls: [
          {
            resource_group: "management-rg",
            name: "management",
            vpc: "management",
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                source: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-ibm-outbound",
                destination: "161.26.0.0/16",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-all-network-outbound",
                source: "10.0.0.0/8",
                acl: "management",
                vpc: "management",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ],
          },
        ],
      },
      {
        cos: "cos",
        bucket: "workload-bucket",
        name: "workload",
        resource_group: "workload-rg",
        classic_access: false,
        manual_address_prefix_management: true,
        default_network_acl_name: null,
        default_security_group_name: null,
        default_routing_table_name: null,
        publicGateways: [],
        address_prefixes: [
          {
            name: "vsi-zone-1",
            cidr: "10.40.0.0/28",
            zone: 1,
            vpc: "workload",
          },
          {
            name: "vsi-zone-2",
            cidr: "10.50.0.0/28",
            zone: 2,
            vpc: "workload",
          },
          {
            name: "vsi-zone-3",
            cidr: "10.60.0.0/28",
            zone: 3,
            vpc: "workload",
          },
          {
            name: "vpe-zone-1",
            cidr: "10.40.0.32/29",
            zone: 1,
            vpc: "workload",
          },
          {
            name: "vpe-zone-2",
            cidr: "10.50.0.32/29",
            zone: 2,
            vpc: "workload",
          },
          {
            name: "vpe-zone-3",
            cidr: "10.60.0.32/29",
            zone: 3,
            vpc: "workload",
          },
        ],
        subnets: [
          {
            vpc: "workload",
            zone: 1,
            cidr: "10.40.0.0/28",
            name: "vsi-zone-1",
            network_acl: "workload",
            resource_group: "workload-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "workload",
            zone: 2,
            cidr: "10.50.0.0/28",
            name: "vsi-zone-2",
            network_acl: "workload",
            resource_group: "workload-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "workload",
            zone: 3,
            cidr: "10.60.0.0/28",
            name: "vsi-zone-3",
            network_acl: "workload",
            resource_group: "workload-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "workload",
            zone: 1,
            cidr: "10.40.0.32/29",
            name: "vpe-zone-1",
            network_acl: "workload",
            resource_group: "workload-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "workload",
            zone: 2,
            cidr: "10.50.0.32/29",
            name: "vpe-zone-2",
            network_acl: "workload",
            resource_group: "workload-rg",
            public_gateway: false,
            has_prefix: false,
          },
          {
            vpc: "workload",
            zone: 3,
            cidr: "10.60.0.32/29",
            name: "vpe-zone-3",
            network_acl: "workload",
            resource_group: "workload-rg",
            public_gateway: false,
            has_prefix: false,
          },
        ],
        public_gateways: [],
        acls: [
          {
            resource_group: "workload-rg",
            name: "workload",
            vpc: "workload",
            rules: [
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-ibm-inbound",
                source: "161.26.0.0/16",
                acl: "workload",
                vpc: "workload",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                source: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-ibm-outbound",
                destination: "161.26.0.0/16",
                acl: "workload",
                vpc: "workload",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "inbound",
                name: "allow-all-network-inbound",
                source: "10.0.0.0/8",
                acl: "workload",
                vpc: "workload",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
              {
                action: "allow",
                destination: "10.0.0.0/8",
                direction: "outbound",
                name: "allow-all-network-outbound",
                source: "10.0.0.0/8",
                acl: "workload",
                vpc: "workload",
                icmp: {
                  type: null,
                  code: null,
                },
                tcp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
                udp: {
                  port_min: null,
                  port_max: null,
                  source_port_min: null,
                  source_port_max: null,
                },
              },
            ],
          },
        ],
      },
    ],
    vpn_gateways: [],
    vpn_servers: [],
    vsi: [],
    classic_ssh_keys: [],
    classic_vlans: [],
    classic_gateways: [],
  });
  let expectedData = `##############################################################################
# Schematics Schematics Agent
##############################################################################

resource "ibm_schematics_agent" "schematics_schematics_agent" {
  agent_location        = var.region
  description           = "schematics Schematics Agent"
  name                  = "\${var.prefix}-schematics-schematics-agent"
  resource_group        = ibm_resource_group.schematics_rg.id
  schematics_location   = var.region
  version               = "1.4.0"
  run_destroy_resources = 1
  agent_infrastructure {
    infra_type             = "ibm_openshift"
    cluster_id             = ibm_container_vpc_cluster.schematics_agent_cluster.id
    cluster_resource_group = ibm_resource_group.schematics_rg.id
    cos_instance_name      = ibm_resource_instance.schematics_cos.name
    cos_bucket_name        = ibm_cos_bucket.agent_bucket.bucket_name
    cos_bucket_region      = var.region
  }
  agent_metadata {
    name = "purpose"
    value = [
      "git",
      "terraform",
      "ansible"
    ]
  }
  tags = [
    "schematics-agent"
  ]
}

resource "ibm_schematics_agent_deploy" "schematics_agent_deploy" {
  agent_id = ibm_schematics_agent.schematics_schematics_agent.id
}

resource "ibm_schematics_policy" "schematics_agent_policy" {
  description    = "Policy to allow execution of actions on schematics-schematics-agent"
  name           = "\${var.prefix}-schematics-agent-policy"
  kind           = "agent_assignment_policy"
  location       = var.region
  resource_group = ibm_resource_group.schematics_rg.id
  parameter {
    agent_assignment_policy_parameter {
      selector_scope {
        kind = "action"
        tags = [
              "schematics-agent"
        ]
        resource_groups = [
              ibm_resource_group.schematics_rg.id
        ]
        locations = [
              var.region
        ]
      }
    }
  }
  target {
    selector_kind = "action"
    selector_ids = [
      ibm_schematics_agent.schematics_schematics_agent.id
    ]
  }
  depends_on = [
    ibm_schematics_agent_deploy.schematics_agent_deploy
  ]
}

##############################################################################
`;
  assert.deepEqual(actualData, expectedData, "it should return correct data");
});
it("should create multiple agent blocks if more than one agent is present", () => {
  let actualData = agentTf({
    _options: {
      prefix: "schematics",
      region: "us-south",
      tags: ["hello", "world"],
      zones: 3,
      endpoints: "private",
      account_id: "",
      fs_cloud: true,
      enable_classic: false,
      dynamic_subnets: false,
      enable_power_vs: true,
      power_vs_zones: ["us-south"],
      craig_version: "1.8.0",
      template: "Power VS SAP Hana",
    },
    access_groups: [],
    agents: [
      {
        name: "schematics",
        cos: "schematics-cos",
        bucket: "agent-bucket",
        vpc: "schematics-vpc",
        cluster: "schematics-agent-cluster",
        cluster_resource_group: "schematics-rg",
        resource_group: "schematics-rg",
        deploy: {
          name: "agent-deploy",
        },
        policy: {
          name: "agent-policy",
          resource_group: "schematics-rg",
        },
      },
      {
        name: "test-2",
        cos: "test-cos",
        bucket: "test-agent-bucket",
        vpc: "test-schematics-vpc",
        cluster: "test-agent-cluster",
        cluster_resource_group: "test-rg",
        resource_group: "test-rg",
        deploy: {
          name: "test-deploy",
        },
        policy: {
          name: "test-policy",
          resource_group: "test-rg",
        },
      },
    ],
    resource_groups: [
      {
        use_prefix: true,
        name: "service-rg",
        use_data: false,
      },
      {
        use_prefix: true,
        name: "management-rg",
        use_data: false,
      },
      {
        use_prefix: true,
        name: "workload-rg",
        use_data: false,
      },
      {
        use_data: false,
        use_prefix: true,
        name: "edge-rg",
      },
      {
        use_data: false,
        name: "powervs-rg",
        use_prefix: true,
      },
    ],
  });

  let expectedData = `##############################################################################
# Schematics Schematics Agent
##############################################################################

resource "ibm_schematics_agent" "schematics_schematics_agent" {
  agent_location        = var.region
  description           = "schematics Schematics Agent"
  name                  = "\${var.prefix}-schematics-schematics-agent"
  resource_group        = ibm_resource_group.schematics_rg.id
  schematics_location   = var.region
  version               = "1.4.0"
  run_destroy_resources = 1
  agent_infrastructure {
    infra_type             = "ibm_openshift"
    cluster_id             = ibm_container_vpc_cluster.schematics_agent_cluster.id
    cluster_resource_group = ibm_resource_group.schematics_rg.id
    cos_instance_name      = ibm_resource_instance.schematics_cos.name
    cos_bucket_name        = ibm_cos_bucket.agent_bucket.bucket_name
    cos_bucket_region      = var.region
  }
  agent_metadata {
    name = "purpose"
    value = [
      "git",
      "terraform",
      "ansible"
    ]
  }
  tags = [
    "schematics-agent"
  ]
}

resource "ibm_schematics_agent_deploy" "schematics_agent_deploy" {
  agent_id = ibm_schematics_agent.schematics_schematics_agent.id
}

resource "ibm_schematics_policy" "schematics_agent_policy" {
  description    = "Policy to allow execution of actions on schematics-schematics-agent"
  name           = "\${var.prefix}-schematics-agent-policy"
  kind           = "agent_assignment_policy"
  location       = var.region
  resource_group = ibm_resource_group.schematics_rg.id
  parameter {
    agent_assignment_policy_parameter {
      selector_scope {
        kind = "action"
        tags = [
              "schematics-agent"
        ]
        resource_groups = [
              ibm_resource_group.schematics_rg.id
        ]
        locations = [
              var.region
        ]
      }
    }
  }
  target {
    selector_kind = "action"
    selector_ids = [
      ibm_schematics_agent.schematics_schematics_agent.id
    ]
  }
  depends_on = [
    ibm_schematics_agent_deploy.schematics_agent_deploy
  ]
}

##############################################################################

##############################################################################
# Test 2 Schematics Agent
##############################################################################

resource "ibm_schematics_agent" "test_2_schematics_agent" {
  agent_location        = var.region
  description           = "test-2 Schematics Agent"
  name                  = "\${var.prefix}-test-2-schematics-agent"
  resource_group        = ibm_resource_group.test_rg.id
  schematics_location   = var.region
  version               = "1.4.0"
  run_destroy_resources = 1
  agent_infrastructure {
    infra_type             = "ibm_openshift"
    cluster_id             = ibm_container_vpc_cluster.test_agent_cluster.id
    cluster_resource_group = ibm_resource_group.test_rg.id
    cos_instance_name      = ibm_resource_instance.test_cos.name
    cos_bucket_name        = ibm_cos_bucket.test_agent_bucket.bucket_name
    cos_bucket_region      = var.region
  }
  agent_metadata {
    name = "purpose"
    value = [
      "git",
      "terraform",
      "ansible"
    ]
  }
  tags = [
    "schematics-agent"
  ]
}

resource "ibm_schematics_agent_deploy" "test_2_agent_deploy" {
  agent_id = ibm_schematics_agent.test_2_schematics_agent.id
}

resource "ibm_schematics_policy" "test_2_agent_policy" {
  description    = "Policy to allow execution of actions on test-2-schematics-agent"
  name           = "\${var.prefix}-test-2-agent-policy"
  kind           = "agent_assignment_policy"
  location       = var.region
  resource_group = ibm_resource_group.test_rg.id
  parameter {
    agent_assignment_policy_parameter {
      selector_scope {
        kind = "action"
        tags = [
              "schematics-agent"
        ]
        resource_groups = [
              ibm_resource_group.test_rg.id
        ]
        locations = [
              var.region
        ]
      }
    }
  }
  target {
    selector_kind = "action"
    selector_ids = [
      ibm_schematics_agent.test_2_schematics_agent.id
    ]
  }
  depends_on = [
    ibm_schematics_agent_deploy.test_2_agent_deploy
  ]
}

##############################################################################
`;
  assert.deepEqual(actualData, expectedData, "it should return correct data");
});
it("should return create additional resources when agent is created", () => {
  let expectedData = `##############################################################################
# Schematics Agent Cluster
##############################################################################

resource "ibm_container_vpc_cluster" "schematics_vpc_vpc_schematics_agent_cluster" {
  name                            = "schematics-agent-cluster"
  vpc_id                          = module.schematics_vpc_vpc.id
  resource_group_id               = ibm_resource_group.schematics_rg.id
  flavor                          = "mx2.32x256"
  worker_count                    = "2"
  kube_version                    = var.cluster_version
  wait_till                       = "IngressReady"
  disable_public_service_endpoint = true
  cos_instance_crn                = ibm_resource_instance.cos.crn
  entitlement                     = "cloud_pak"
  tags = [
    "misp",
    "agent"
  ]
  zones {
    name      = "\${var.region}-3"
    subnet_id = module.schematics_vpc_vpc.subnet_agent_zone_1_id
  }
  zones {
    name      = "\${var.region}-2"
    subnet_id = module.schematics_vpc_vpc.subnet_agent_zone_2_id
  }
  timeouts {
    create = "3h"
    update = "3h"
    delete = "2h"
  }
  kms_config {
    crk_id           = ibm_kms_key.hpcs_agent_key_key.key_id
    instance_id      = data.ibm_resource_instance.hpcs.guid
    private_endpoint = false
  }
}


data "ibm_is_security_groups" "groups" {
  vpc_crn = module.schematics_vpc_vpc.crn
  depends_on = [
    ibm_container_vpc_cluster.schematics_vpc_vpc_schematics_agent_cluster
  ]
}

locals {
  cluster_security_group_id = [
    for group in data.ibm_is_security_groups.groups.security_groups :
    group if group.name == "kube-\${ibm_container_vpc_cluster.schematics_vpc_vpc_schematics_agent_cluster.id}"
  ][0].id
}

resource "ibm_is_security_group_rule" "schematics_cluster_allow_inbound_443" {
  direction = "inbound"
  group     = local.cluster_security_group_id
  remote    = "0.0.0.0/0"
  tcp {
    port_max = 443
    port_min = 443
  }
}

resource "ibm_is_security_group_rule" "schematics_cluster_allow_outbound_443" {
  direction = "outbound"
  group     = local.cluster_security_group_id
  remote    = "0.0.0.0/0"
  tcp {
    port_max = 443
    port_min = 443
  }
}

resource "ibm_is_security_group_rule" "schematics_cluster_allow_outbound_22" {
  direction = "outbound"
  group     = local.cluster_security_group_id
  remote    = "10.0.0.0/8"
  tcp {
    port_max = 22
    port_min = 22
  }
}

resource "ibm_is_security_group_rule" "schematics_cluster_allow_inbound_22" {
  direction = "inbound"
  group     = local.cluster_security_group_id
  remote    = "10.0.0.0/8"
  tcp {
    port_max = 22
    port_min = 22
  }
}

##############################################################################

##############################################################################
# Object Storage Instance Demo Cos Object Storage 1aajhb 7c
##############################################################################

resource "random_string" "cos_random_suffix" {
  length  = 8
  special = false
  upper   = false
}


resource "ibm_resource_instance" "cos" {
  name              = "schematics-agent-cos-\${random_string.cos_random_suffix.result}"
  resource_group_id = data.ibm_resource_group.resource_group.id
  service           = "cloud-object-storage"
  location          = "global"
  plan              = "standard"
  tags              = ["schematics-agent"]
}

resource "ibm_iam_authorization_policy" "cos_cos_to_kms_kms_policy" {
  source_service_name         = "cloud-object-storage"
  source_resource_instance_id = ibm_resource_instance.cos.guid
  description                 = "Allow COS instance to read from KMS instance"
  target_service_name         = "hs-crypto"
  target_resource_instance_id = data.ibm_resource_instance.hpcs.guid
  roles = [
    "Reader"
  ]
}

resource "ibm_cos_bucket" "agent_bucket" {
  bucket_name          = "schematics-agent-cos-bucket-2-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos.id
  storage_class        = "smart"
  endpoint_type        = "private"
  force_delete         = true
  region_location      = var.region
  key_protect          = ibm_kms_key.hpcs_agent_key_key.crn
  depends_on = [
    ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy
  ]
}

resource "ibm_cos_bucket" "flow_logs" {
  bucket_name          = "schematics-agent-cos-flow-logs-bucket-2-\${random_string.cos_random_suffix.result}"
  resource_instance_id = ibm_resource_instance.cos.id
  storage_class        = "smart"
  endpoint_type        = "private"
  force_delete         = true
  region_location      = var.region
  key_protect          = ibm_kms_key.hpcs_agent_key_key.crn
  depends_on = [
    ibm_iam_authorization_policy.cos_cos_to_kms_kms_policy
  ]
}

##############################################################################

##############################################################################
# Flow Logs Resources
##############################################################################

resource "ibm_iam_authorization_policy" "flow_logs_to_cos_object_storage_policy" {
  source_service_name         = "is"
  source_resource_type        = "flow-log-collector"
  description                 = "Allow flow logs write access cloud object storage instance"
  target_service_name         = "cloud-object-storage"
  target_resource_instance_id = ibm_resource_instance.cos.guid
  roles = [
    "Writer"
  ]
}

resource "ibm_is_flow_log" "schematics_vpc_flow_log_collector" {
  name           = "schematics-schematics-vpc-vpc-logs"
  target         = module.schematics_vpc_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.flow_logs.bucket_name
  resource_group = data.ibm_resource_group.resource_group.id
  tags = [
    "misp",
    "agent"
  ]
  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

##############################################################################`;
});
