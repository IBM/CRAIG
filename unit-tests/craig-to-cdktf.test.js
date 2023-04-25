const { assert } = require("chai");
const craig = require("./data-files/craig-json.json");
const cdktf = require("./data-files/craig-cdktf.json");
const f5nw = require("./data-files/f5-nw.json");
const teleportNw = require("./data-files/appid-scc-teleport-network.json");
const { craigToCdktf } = require("../client/src/lib/craig-to-cdktf");

describe("craigToCdktf", () => {
  // it("should convert craig data to cdktf", () => {
  //   let actualData = craigToCdktf(craig);
  //   assert.deepEqual(actualData, cdktf, "it should return cdktf data");
  // });
  it("should convert craig data to cdktf resource groups", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_resource_group;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_resource_group,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf atracker", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_atracker_target;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_atracker_target,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf atracker tracker", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_atracker_route;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_atracker_route,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf clusters", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_container_vpc_cluster;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_container_vpc_cluster,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf cluster worker pools", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_container_vpc_worker_pool;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_container_vpc_worker_pool,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf iam authorization policies", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_iam_authorization_policy;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_iam_authorization_policy,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf flow log collector", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_flow_log;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_flow_log,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf resources", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_resource_instance;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_resource_instance,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf kms key rings", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_kms_key_rings;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_kms_key_rings,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf kms keys", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_kms_key;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_kms_key,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf kms key policies", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_kms_key_policies;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_kms_key_policies,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf cos buckets", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_cos_bucket;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_cos_bucket,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf cos keys", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_resource_key;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_resource_key,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf security groups", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_security_group;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_security_group,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf security group rules", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_security_group_rule;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_security_group_rule,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ssh keys", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_ssh_key;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_ssh_key,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ssh key variable", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.variable;
    assert.deepEqual(data, cdktf.variable, "it should return cdktf data");
  });
  it("should convert craig data to cdktf tgw", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_tg_gateway;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_tg_gateway,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf tgw connection", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_tg_connection;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_tg_connection,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_subnet_reserved_ip", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_subnet_reserved_ip;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_subnet_reserved_ip,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_virtual_endpoint_gateway", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_virtual_endpoint_gateway;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_virtual_endpoint_gateway,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_virtual_endpoint_gateway_ip", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_virtual_endpoint_gateway_ip;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_virtual_endpoint_gateway_ip,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_instance", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_instance;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_instance,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_vpc", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_vpc;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_vpc,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_vpc_address_prefix", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_vpc_address_prefix;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_vpc_address_prefix,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_network_acl", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_network_acl;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_network_acl,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_network_acl_rule", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_network_acl_rule;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_network_acl_rule,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_subnet", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_subnet;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_subnet,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_is_vpn_gateway", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.resource.ibm_is_vpn_gateway;
    assert.deepEqual(
      data,
      cdktf.resource.ibm_is_vpn_gateway,
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf for images", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.data;
    assert.deepEqual(data, cdktf.data, "it should return cdktf data");
  });
  it("should convert craig data to cdktf for provider", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.provider;
    assert.deepEqual(data, cdktf.provider, "it should return cdktf data");
  });
  it("should convert craig data to cdktf for variable", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.variable;
    assert.deepEqual(data, cdktf.variable, "it should return cdktf data");
  });
  it("should convert craig data to cdktf for terraform", () => {
    let actualData = craigToCdktf(craig);
    let data = actualData.terraform;
    assert.deepEqual(data, cdktf.terraform, "it should return cdktf data");
  });
  it("should convert craig data to cdktf ibm_iam_account_settings", () => {
    let actualData = craigToCdktf(f5nw);
    let data = actualData.resource.ibm_iam_account_settings;
    assert.deepEqual(
      data,
      {
        iam_account_settings: {
          mfa: "NONE",
          allowed_ip_addresses: "1.1.1.1/10,10.10.10.10",
          include_history: false,
          if_match: 1,
          max_sessions_per_identity: 1,
          restrict_create_service_id: "RESTRICTED",
          restrict_create_platform_apikey: "RESTRICTED",
          session_expiration_in_seconds: "900",
          session_invalidation_in_seconds: "900",
        },
      },
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_iam_access_group", () => {
    let actualData = craigToCdktf(f5nw);
    let data = actualData.resource.ibm_iam_access_group;
    assert.deepEqual(
      data,
      {
        foo_group_access_group: {
          name: "slz-foo-group-ag",
          description: "lfadsf",
          tags: ["slz", "landing-zone"],
        },
      },
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_iam_access_group_policy", () => {
    let actualData = craigToCdktf(f5nw);
    let data = actualData.resource.ibm_iam_access_group_policy;
    assert.deepEqual(
      data,
      {
        foo_group_foo_policy_policy: {
          access_group_id: "${ibm_iam_access_group.foo_group_access_group.id}",
          roles: undefined,
          resources: [
            {
              resource_group: "service-rg",
              resource_type: "fake-resource-type",
              resource: "frogs",
              service: "frog-service",
              resource_instance_id: "thisisanid",
            },
          ],
        },
      },
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_iam_access_group_dynamic_rule", () => {
    let actualData = craigToCdktf(f5nw);
    let data = actualData.resource.ibm_iam_access_group_dynamic_rule;
    assert.deepEqual(
      data,
      {
        foo_group_foo_dynamic_policy_dynamic_rule: {
          name: "foo-group-foo-dynamic-policy-dynamic-rule",
          access_group_id: "${ibm_iam_access_group.foo_group_access_group.id}",
          expiration: 1,
          identity_provider: "fake-identity-provider",
          conditions: [
            { claim: "frogs-claim", operator: "EQUALS", value: "green-frogs" },
          ],
        },
      },
      "it should return cdktf data"
    );
  });
  it("should convert craig data to cdktf ibm_iam_access_group_members", () => {
    let actualData = craigToCdktf(f5nw);
    let data = actualData.resource.ibm_iam_access_group_members;
    assert.deepEqual(
      data,
      {
        foo_group_invites: {
          access_group_id: "${ibm_iam_access_group.foo_group_access_group.id}",
          ibm_ids: ["test@ibm.com"],
        },
      },
      "it should return cdktf data"
    );
  });
  describe("edge cases", () => {
    it("should convert craig data to cdktf atracker when disabled", () => {
      let newCraig = { ...craig };
      newCraig.atracker.enabled = false;
      let actualData = craigToCdktf(newCraig);
      let data = actualData.resource.ibm_atracker_target;
      assert.deepEqual(data, undefined, "it should return cdktf data");
      assert.deepEqual(
        actualData.resource.ibm_atracker_route,
        undefined,
        "it should return cdktf data"
      );
    });
    it("should convert craig data to cdktf atracker when no route", () => {
      let newCraig = { ...craig };
      newCraig.atracker.add_route = false;
      let actualData = craigToCdktf(newCraig);
      let data = actualData.resource.ibm_atracker_route;
      assert.deepEqual(data, undefined, "it should return cdktf data");
    });
    it("should convert craig data to cdktf rg when not using prefix", () => {
      let newCraig = { ...craig };
      newCraig.resource_groups[0].use_prefix = false;
      let actualData = craigToCdktf(newCraig);
      let data = actualData.resource.ibm_resource_group;
      assert.deepEqual(
        data,
        {
          slz_service_rg: {
            name: "slz-service-rg",
            tags: ["slz", "landing-zone"],
          },
          slz_management_rg: {
            name: "slz-slz-management-rg",
            tags: ["slz", "landing-zone"],
          },
          slz_workload_rg: {
            name: "slz-slz-workload-rg",
            tags: ["slz", "landing-zone"],
          },
        },
        "it should return cdktf data"
      );
    });
    it("should convert craig data to cdktf ssh key when using data", () => {
      let newCraig = { ...craig };
      newCraig.ssh_keys[0].use_data = true;
      let actualData = craigToCdktf(newCraig);
      let data = actualData.resource.ibm_is_ssh_key;
      assert.deepEqual(data, undefined, "it should return cdktf data");
      assert.deepEqual(
        actualData.data.ibm_is_ssh_key,
        { slz_ssh_key: { name: "slz-ssh-key" } },
        "it should return cdktf data"
      );
    });
    it("should convert craig data to cdktf vsi data when a local ref is used for image", () => {
      let newCraig = { ...craig };
      newCraig.vsi[0].image = "local";
      let actualData = craigToCdktf(newCraig);
      assert.deepEqual(
        actualData.resource.ibm_is_instance
          .management_vpc_management_server_vsi_2_1.image,
        "local",
        "it should return cdktf data"
      );
    });
    it("should convert craig data when no vpc reader role for kms", () => {
      let newCraig = { ...craig };
      newCraig.key_management[0].authorize_vpc_reader_role = false;
      let actualData = craigToCdktf(newCraig);
      let data = actualData.resource.ibm_iam_authorization_policy;
      assert.deepEqual(
        data,
        {
          flow_logs_to_cos_object_storage_policy: {
            source_service_name: "is",
            source_resource_type: "flow-log-collector",
            description:
              "Allow flow logs write access cloud object storage instance",
            roles: ["Writer"],
            target_service_name: "cloud-object-storage",
            target_resource_instance_id:
              '${ibm_resource_instance.cos_object_storage.guid}',
          },
          atracker_cos_cos_to_slz_kms_kms_policy: {
            source_service_name: "cloud-object-storage",
            source_resource_instance_id:
              '${ibm_resource_instance.atracker_cos_object_storage.guid}',
            roles: ["Reader"],
            description: "Allow COS instance to read from KMS instance",
            target_service_name: "kms",
            target_resource_instance_id:
              "${ibm_resource_instance.slz_kms.guid}",
          },
          cos_cos_to_slz_kms_kms_policy: {
            source_service_name: "cloud-object-storage",
            source_resource_instance_id:
              '${ibm_resource_instance.cos_object_storage.guid}',
            roles: ["Reader"],
            description: "Allow COS instance to read from KMS instance",
            target_service_name: "kms",
            target_resource_instance_id:
              "${ibm_resource_instance.slz_kms.guid}",
          },
        },
        "it should return cdktf data"
      );
    });
    describe("teleport, appid, etc", () => {
      it("should return teleport locals", () => {
        let actualData = craigToCdktf(teleportNw).locals;
        assert.deepEqual(
          actualData,
          {
            test_deployment_user_data:
              'templatefile(\n    "${path.module}/cloud-init.tpl",\n    {\n      TELEPORT_LICENSE          = base64encode(tostring("TELEPORT_LICENSE"))\n      HTTPS_CERT                = base64encode(tostring("HTTPS_CERT"))\n      HTTPS_KEY                 = base64encode(tostring("HTTPS_KEY"))\n      HOSTNAME                  = tostring("HOSTNAME")\n      DOMAIN                    = tostring("DOMAIN")\n      COS_BUCKET                = ibm_cos_bucket.atracker_cos_object_storage_atracker_bucket_bucket.bucket_name\n      COS_BUCKET_ENDPOINT       = ibm_cos_bucket.atracker_cos_object_storage_atracker_bucket_bucket.s3_endpoint_public\n      HMAC_ACCESS_KEY_ID        = ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key.credentials["cos_hmac_keys.access_key_id"]\n      HMAC_SECRET_ACCESS_KEY_ID = ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key.credentials["cos_hmac_keys.secret_access_key"]\n      APPID_CLIENT_ID           = ibm_resource_key.test_appid_test_key_key.credentials["clientId"]\n      APPID_CLIENT_SECRET       = ibm_resource_key.test_appid_test_key_key.credentials["secret"]\n      APPID_ISSUER_URL          = ibm_resource_key.test_appid_test_key_key.credentials["oauthServerUrl"]\n      TELEPORT_VERSION          = tostring("TELEPORT_VERSION")\n      MESSAGE_OF_THE_DAY        = tostring("MESSAGE_OF_THE_DAY")\n      CLAIM_TO_ROLES            = [\n        {\n          email = "email@email.email"\n          roles = ["role1","role2"]\n        },\n        {\n          email = "email2@email.email"\n          roles = ["role1","role2"]\n        }\n      ]\n    }\n  )',
          },
          "it should return teleport locals"
        );
      });
      it("should return teleport template data", () => {
        let actualData =
          craigToCdktf(teleportNw).data.template_cloudinit_config;
        assert.deepEqual(
          actualData,
          {
            test_deployment_cloud_init: {
              base64_encode: false,
              gzip: false,
              part: [
                {
                  content: "${local.test_deployment_user_data}",
                },
              ],
            },
          },
          "it should return teleport locals"
        );
      });
      it("should convert craig data to cdktf vsi data when using teleport", () => {
        let actualData = craigToCdktf(teleportNw);
        assert.isObject(
          actualData.resource.ibm_iam_authorization_policy
            .secrets_manager_to_slz_kms_kms_policy,
          "it should have auth policy"
        );
        assert.deepEqual(
          actualData.resource.ibm_is_instance,
          {
            management_vpc_management_server_vsi_1_1: {
              name: "slz-management-management-server-vsi-zone-1-1",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-1",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_1.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
            },
            management_vpc_management_server_vsi_1_2: {
              name: "slz-management-management-server-vsi-zone-1-2",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-1",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_1.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
            },
            management_vpc_management_server_vsi_2_1: {
              name: "slz-management-management-server-vsi-zone-2-1",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-2",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_2.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
            },
            management_vpc_management_server_vsi_2_2: {
              name: "slz-management-management-server-vsi-zone-2-2",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-2",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_2.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
            },
            management_vpc_management_server_vsi_3_1: {
              name: "slz-management-management-server-vsi-zone-3-1",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-3",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_3.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
            },
            management_vpc_management_server_vsi_3_2: {
              name: "slz-management-management-server-vsi-zone-3-2",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-3",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_3.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
            },
            slz_slz_slz_test_deployment_teleport_vsi: {
              name: "slz-slz-slz-test-deployment",
              image:
                "${data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id}",
              profile: "cx2-4x8",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              zone: "us-south-1",
              tags: ["slz", "landing-zone"],
              primary_network_interface: [
                {
                  subnet: "${ibm_is_subnet.management_vsi_zone_1.id}",
                  security_groups: [
                    "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
                  ],
                },
              ],
              boot_volume: [
                {
                  encryption:
                    "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
                },
              ],
              keys: ["${ibm_is_ssh_key.slz_ssh_key.id}"],
              user_data:
                "${data.template_cloudinit_config.test_deployment_cloud_init.rendered}",
            },
          },
          "it should return cdktf data"
        );
      });
      it("should convert craig data to cdktf resources with secrets manager and event streams", () => {
        let actualData = craigToCdktf(teleportNw);
        let data = actualData.resource.ibm_resource_instance;
        assert.deepEqual(
          data,
          {
            atracker_cos_object_storage: {
              name: "slz-atracker-cos-object-storage-${random_string.atracker_cos_random_suffix.result}",
              resource_group_id: "${ibm_resource_group.slz_service_rg.id}",
              service: "cloud-object-storage",
              location: "global",
              plan: "standard",
              tags: ["slz", "landing-zone"],
            },
            cos_object_storage: {
              name: "slz-cos-object-storage-${random_string.cos_random_suffix.result}",
              resource_group_id: "${ibm_resource_group.slz_service_rg.id}",
              service: "cloud-object-storage",
              location: "global",
              plan: "standard",
              tags: ["slz", "landing-zone"],
            },
            slz_kms: {
              name: "slz-slz-kms",
              resource_group_id: "${ibm_resource_group.slz_service_rg.id}",
              service: "kms",
              plan: "tiered-pricing",
              location: "us-south",
              tags: ["slz", "landing-zone"],
            },
            event_streams_es: {
              name: "slz-event-streams",
              service: "messagehub",
              plan: "enterprise-3nodes-2tb",
              location: "us-south",
              resource_group_id: "${ibm_resource_group.slz_service_rg.id}",
              timeouts: [{ create: "3h", update: "1h", delete: "1h" }],
            },
            test_appid: {
              name: "slz-test-appid",
              resource_group_id: "${ibm_resource_group.slz_service_rg.id}",
              tags: ["slz", "landing-zone"],
              service: "appid",
              plan: "graduated-tier",
              location: "us-south",
            },
            secrets_manager_secrets_manager: {
              name: "slz-secrets-manager",
              location: "us-south",
              plan: "standard",
              service: "secrets-manager",
              resource_group_id: "${ibm_resource_group.slz_service_rg.id}",
              parameters: {
                kms_key: "${ibm_kms_key.slz_kms_slz_slz_key_key.crn}",
              },
              timeouts: [{ create: "1h", delete: "1h" }],
              tags: ["slz", "landing-zone"],
              depends_on: [
                "${ibm_iam_authorization_policy.secrets_manager_to_slz_kms_kms_policy}",
              ],
            },
          },
          "it should return cdktf data"
        );
      });
      it("should return appid keys", () => {
        let actualData = craigToCdktf(teleportNw).resource.ibm_resource_key;
        assert.deepEqual(
          actualData,
          {
            atracker_cos_object_storage_key_cos_bind_key: {
              name: "slz-atracker-cos-key-cos-bind-key-${random_string.atracker_cos_random_suffix.result}",
              resource_instance_id:
                "${ibm_resource_instance.atracker_cos_object_storage.id}",
              role: "Writer",
              tags: ["slz", "landing-zone"],
            },
            test_appid_key_test_key: {
              name: "slz-test-appid-test-key",
              resource_instance_id: "${ibm_resource_instance.test_appid.id}",
              role: "Writer",
              tags: ["slz", "landing-zone"],
            },
            test_appid_key_test_key_2: {
              name: "slz-test-appid-test-key-2",
              resource_instance_id: "${ibm_resource_instance.test_appid.id}",
              role: "Writer",
              tags: ["slz", "landing-zone"],
            },
          },
          "it should return data"
        );
      });
      it("should return appid redirect urls", () => {
        let actualData =
          craigToCdktf(teleportNw).resource.ibm_appid_redirect_urls;
        assert.deepEqual(
          actualData,
          {
            slz_slz_slz_slz_slz_slz_test_deployment_appid_urls: {
              tenant_id: "${ibm_resource_instance.test_appid.guid}",
              urls: [
                "https://slz-slz-slz-slz-slz-slz-slz-test-deployment-teleport-vsi.DOMAIN:3080/v1/webapi/oidc/callback",
              ],
            },
          },
          "it should return data"
        );
      });
      it("should return scc data", () => {
        let actualData = craigToCdktf(teleportNw);
        let settings = actualData.resource.ibm_scc_account_settings;
        let cred = actualData.resource.ibm_scc_posture_credential;
        let collector = actualData.resource.ibm_scc_posture_collector;
        let scope = actualData.resource.ibm_scc_posture_scope;
        assert.deepEqual(
          settings,
          {
            ibm_scc_account_settings_instance: {
              location: [{ location_id: "us" }],
            },
          },
          "it should return correct data"
        );
        assert.deepEqual(
          cred,
          {
            scc_credentials: {
              description: "scc posture credential description",
              enabled: true,
              name: "scc-posture-credential",
              type: "ibm_cloud",
              purpose: "discovery_fact_collection_remediation",
              display_fields: [{ ibm_api_key: "${var.ibmcloud_api_key}" }],
              group: [
                { id: "scc_group_id", passphrase: "scc_group_passphrase" },
              ],
            },
          },
          "it should return correct data"
        );
        assert.deepEqual(
          collector,
          {
            collector: {
              description: "scc collector",
              is_public: true,
              managed_by: "ibm",
              name: "slz-scc-collector",
            },
          },
          "it should return correct data"
        );
        assert.deepEqual(
          scope,
          {
            scc_scope: {
              collector_ids: ["${ibm_scc_posture_collector.collector.id}"],
              credential_id: "${ibm_scc_posture_credential.scc_credentials.id}",
              credential_type: "ibm",
              description: "scc scope",
              name: "slz-scc-scope",
            },
          },
          "it should return correct data"
        );
      });
      it("should return load balancer data", () => {
        let actualData = craigToCdktf(teleportNw);
        let lb = actualData.resource.ibm_is_lb;
        let pool = actualData.resource.ibm_is_lb_pool;
        let members = actualData.resource.ibm_is_lb_pool_member;
        let listener = actualData.resource.ibm_is_lb_listener;
        assert.deepEqual(
          lb,
          {
            lb_1_load_balancer: {
              name: "slz-lb-1-lb",
              type: "public",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              tags: ["slz", "landing-zone"],
              security_groups: [
                "${ibm_is_security_group.management_vpc_management_vpe_sg_sg.id}",
              ],
              subnets: [
                "${ibm_is_subnet.management_vsi_zone_1.id}",
                "${ibm_is_subnet.management_vsi_zone_2.id}",
                "${ibm_is_subnet.management_vsi_zone_3.id}",
              ],
            },
          },
          "it should return correct data"
        );
        assert.deepEqual(
          pool,
          {
            lb_1_load_balancer_pool: {
              lb: "${ibm_is_lb.lb_1_load_balancer.id}",
              name: "slz-lb-1-lb-pool",
              algorithm: "round_robin",
              protocol: "tcp",
              health_delay: 60,
              health_retries: 5,
              health_timeout: 30,
              health_type: "https",
              proxy_protocol: "v1",
              session_persistence_type: "app_cookie",
              session_persistence_app_cookie_name: "cookie1",
            },
          },
          "it should return correct data"
        );
        assert.deepEqual(
          members,
          {
            lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member:
              {
                port: 80,
                lb: "${ibm_is_lb.lb_1_load_balancer.id}",
                pool: '${ibm_is_lb_pool.lb_1_load_balancer_pool.pool_id}',
                target_address:
                  "${ibm_is_instance.management_vpc_management_server_vsi_1_1.primary_network_interface.0.primary_ip.0.address}",
              },
            lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member:
              {
                port: 80,
                lb: "${ibm_is_lb.lb_1_load_balancer.id}",
                pool: '${ibm_is_lb_pool.lb_1_load_balancer_pool.pool_id}',
                target_address:
                  "${ibm_is_instance.management_vpc_management_server_vsi_1_2.primary_network_interface.0.primary_ip.0.address}",
              },
            lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member:
              {
                port: 80,
                lb: "${ibm_is_lb.lb_1_load_balancer.id}",
                pool: '${ibm_is_lb_pool.lb_1_load_balancer_pool.pool_id}',
                target_address:
                  "${ibm_is_instance.management_vpc_management_server_vsi_2_1.primary_network_interface.0.primary_ip.0.address}",
              },
            lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member:
              {
                port: 80,
                lb: "${ibm_is_lb.lb_1_load_balancer.id}",
                pool: '${ibm_is_lb_pool.lb_1_load_balancer_pool.pool_id}',
                target_address:
                  "${ibm_is_instance.management_vpc_management_server_vsi_2_2.primary_network_interface.0.primary_ip.0.address}",
              },
            lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member:
              {
                port: 80,
                lb: "${ibm_is_lb.lb_1_load_balancer.id}",
                pool: '${ibm_is_lb_pool.lb_1_load_balancer_pool.pool_id}',
                target_address:
                  "${ibm_is_instance.management_vpc_management_server_vsi_3_1.primary_network_interface.0.primary_ip.0.address}",
              },
            lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member:
              {
                port: 80,
                lb: "${ibm_is_lb.lb_1_load_balancer.id}",
                pool: '${ibm_is_lb_pool.lb_1_load_balancer_pool.pool_id}',
                target_address:
                  "${ibm_is_instance.management_vpc_management_server_vsi_3_2.primary_network_interface.0.primary_ip.0.address}",
              },
          },
          "it should return correct data"
        );
        assert.deepEqual(
          listener,
          {
            lb_1_listener: {
              lb: "${ibm_is_lb.lb_1_load_balancer.id}",
              default_pool: "${ibm_is_lb_pool.lb_1_load_balancer_pool.id}",
              port: 443,
              protocol: "https",
              connection_limit: 2,
              depends_on: [
                "ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member",
                "ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member",
                "ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member",
                "ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member",
                "ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member",
                "ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member",
              ],
            },
          },
          "it should return correct data"
        );
      });
      it("should return public gateways", () => {
        teleportNw.vpcs[0].public_gateways.push({
          vpc: "management",
          zone: 1,
          resource_group: "slz-management-rg",
        });
        let actualData =
          craigToCdktf(teleportNw).resource.ibm_is_public_gateway;
        assert.deepEqual(
          actualData,
          {
            management_gateway_zone_1: {
              name: "slz-management-gateway-zone-1",
              vpc: "${ibm_is_vpc.management_vpc.id}",
              resource_group: "${ibm_resource_group.slz_management_rg.id}",
              zone: "us-south-1",
              tags: ["slz", "landing-zone"],
            },
          },
          "it should return teleport locals"
        );
      });
      it("should return storage volumes", () => {
        teleportNw.vsi[0].volumes = [
          {
            name: "block-storage-1",
            zone: 1,
            profile: "custom",
            capacity: 200,
            iops: 1000,
            encryption_key: "slz-vsi-volume-key",
          },
        ];
        let actualData = craigToCdktf(teleportNw).resource.ibm_is_volume;
        assert.deepEqual(
          actualData,
          {
            management_vpc_management_server_vsi_1_1_block_storage_1: {
              name: "slz-management-management-server-vsi-zone-1-1-block-storage-1",
              profile: "custom",
              zone: "us-south-1",
              iops: 1000,
              capacity: 200,
              encryption_key:
                "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
              tags: ["slz", "landing-zone"],
            },
            management_vpc_management_server_vsi_1_2_block_storage_1: {
              name: "slz-management-management-server-vsi-zone-1-2-block-storage-1",
              profile: "custom",
              zone: "us-south-1",
              iops: 1000,
              capacity: 200,
              encryption_key:
                "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
              tags: ["slz", "landing-zone"],
            },
            management_vpc_management_server_vsi_2_1_block_storage_1: {
              name: "slz-management-management-server-vsi-zone-2-1-block-storage-1",
              profile: "custom",
              zone: "us-south-2",
              iops: 1000,
              capacity: 200,
              encryption_key:
                "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
              tags: ["slz", "landing-zone"],
            },
            management_vpc_management_server_vsi_2_2_block_storage_1: {
              name: "slz-management-management-server-vsi-zone-2-2-block-storage-1",
              profile: "custom",
              zone: "us-south-2",
              iops: 1000,
              capacity: 200,
              encryption_key:
                "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
              tags: ["slz", "landing-zone"],
            },
            management_vpc_management_server_vsi_3_1_block_storage_1: {
              name: "slz-management-management-server-vsi-zone-3-1-block-storage-1",
              profile: "custom",
              zone: "us-south-3",
              iops: 1000,
              capacity: 200,
              encryption_key:
                "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
              tags: ["slz", "landing-zone"],
            },
            management_vpc_management_server_vsi_3_2_block_storage_1: {
              name: "slz-management-management-server-vsi-zone-3-2-block-storage-1",
              profile: "custom",
              zone: "us-south-3",
              iops: 1000,
              capacity: 200,
              encryption_key:
                "${ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn}",
              tags: ["slz", "landing-zone"],
            },
          },
          "it should return teleport locals"
        );
      });
    });
    describe("f5", () => {
      it("should create template file data", () => {
        let actualData = craigToCdktf(f5nw).data.template_file;
        assert.deepEqual(
          actualData,
          {
            user_data_f5_ve_01_zone_1: {
              template: "${local.template_file}",
              vars: {
                tmos_admin_password: "${var.tmos_admin_password}",
                configsync_interface: "1.1",
                hostname: "f5-ve-01",
                domain: "local",
                default_route_interface: "1.1",
                default_route_gateway:
                  "${cidrhost(ibm_is_subnet.edge_f5_management_zone_1.cidr, 1)}",
                do_local_declaration: "${local.do_local_declaration}",
                do_declaration_url: "hi",
                as3_declaration_url: "hi",
                ts_declaration_url: "hi",
                phone_home_url: "hi",
                tgactive_url: "hi",
                tgstandby_url: "hi",
                tgrefresh_url: "hi",
                template_source:
                  "f5devcentral/ibmcloud_schematics_bigip_multinic_declared",
                template_version: "hi",
                zone: "us-south-1",
                vpc: "${ibm_is_vpc.edge_vpc.id}",
                app_id: "hi",
              },
            },
          },
          "it should return template file"
        );
      });
      it("should return locals for f5", () => {
        let actualData = craigToCdktf(f5nw).locals;
        assert.deepEqual(
          actualData,
          {
            public_image_map: {
              "f5-bigip-15-1-5-1-0-0-14-all-1slot": {
                '"eu-de"': "r010-b14deae9-43fd-4850-b89d-5d6485d61acb",
                '"jp-tok"': "r022-cfdb6280-c200-4261-af3a-a8d44bbd18ba",
                '"br-sao"': "r042-3915f0e3-aadc-4fc9-95a8-840f8cb163de",
                '"au-syd"': "r026-ed57accf-b3d4-4ca9-a6a6-e0a63ee1aba4",
                '"us-south"': "r006-c9f07041-bb56-4492-b25c-5f407ebea358",
                '"eu-gb"': "r018-6dce329f-a6eb-4146-ba3e-5560afc84aa1",
                '"jp-osa"': "r034-4ecc10ff-3dc7-42fb-9cae-189fb559dd61",
                '"us-east"': "r014-87371e4c-3645-4579-857c-7e02fe5e9ff4",
                '"ca-tor"': "r038-0840034f-5d05-4a6d-bdae-123628f1d323",
              },
              "f5-bigip-15-1-5-1-0-0-14-ltm-1slot": {
                '"eu-de"': "r010-efad005b-4deb-45a8-b1c5-5b3cea55e7e3",
                '"jp-tok"': "r022-35126a90-aec2-4934-a628-d1ce90bcf68a",
                '"br-sao"': "r042-978cecaf-7f2a-44bc-bffd-ddcf6ce56b11",
                '"au-syd"': "r026-429369e1-d917-4d9c-8a8c-3a8606e26a72",
                '"us-south"': "r006-afe3c555-e8ba-4448-9983-151a14edf868",
                '"eu-gb"': "r018-f2083d86-6f25-42d6-b66a-d5ed2a0108d2",
                '"jp-osa"': "r034-edd01010-b7ee-411c-9158-d41960bf9def",
                '"us-east"': "r014-41db5a03-ab7f-4bf7-95c2-8edbeea0e3af",
                '"ca-tor"': "r038-f5d750b1-61dc-4fa5-98d3-a790417f07dd",
              },
              "f5-bigip-16-1-2-2-0-0-28-ltm-1slot": {
                '"eu-de"': "r010-c90f3597-d03e-4ce6-8efa-870c782952cd",
                '"jp-tok"': "r022-0da3fc1b-c243-4702-87cc-b5a7f5e1f035",
                '"br-sao"': "r042-0649e2fc-0d27-4950-99a8-1d968bc72dd5",
                '"au-syd"': "r026-9de34b46-fc95-4940-a074-e45ac986c761",
                '"us-south"': "r006-863f431b-f4e2-4d8c-a358-07746a146ea1",
                '"eu-gb"': "r018-a88026c2-89b4-43d6-8688-f28ac259627d",
                '"jp-osa"': "r034-585692ec-9508-4a41-bcc3-3a94b31ad161",
                '"us-east"': "r014-b675ae9f-109d-4499-9639-2fbc7b1d55e9",
                '"ca-tor"': "r038-56cc321b-1920-443e-a400-c58905c8f46c",
              },
              "f5-bigip-16-1-2-2-0-0-28-all-1slot": {
                '"eu-de"': "r010-af6fa90b-ea18-48af-bfb9-a3605d60224d",
                '"jp-tok"': "r022-d2bffe3c-084e-43ae-b331-ec82b15af705",
                '"br-sao"': "r042-2dcd1226-5dd9-4b8d-89c5-5ba4f162b966",
                '"au-syd"': "r026-1f8b30f1-af86-433d-861c-7ff36d69176b",
                '"us-south"': "r006-1c0242c4-a99c-4d27-ad2c-4003a7fea131",
                '"eu-gb"': "r018-d33e87cb-0342-41e2-8e29-2b0db4a5881f",
                '"jp-osa"': "r034-1b04698d-9935-4477-8f72-958c7f08c85f",
                '"us-east"': "r014-015d6b06-611e-4e1a-9284-551ed3832182",
                '"ca-tor"': "r038-b7a44268-e95f-425b-99ac-6ec5fc2c4cdc",
              },
            },
            do_byol_license:
              "${<<EOD\n    schemaVersion: 1.0.0\n    class: Device\n    async: true\n    label: Cloudinit Onboarding\n    Common:\n      class: Tenant\n      byoLicense:\n        class: License\n        licenseType: regKey\n        regKey: null\nEOD}",
            do_regekypool:
              "${<<EOD\n    schemaVersion: 1.0.0\n    class: Device\n    async: true\n    label: Cloudinit Onboarding\n    Common:\n      class: Tenant\n      poolLicense:\n        class: License\n        licenseType: licensePool\n        bigIqHost: host\n        bigIqUsername: username\n        bigIqPassword: f5bigip\n        licensePool: pool\n        reachable: false\n        hypervisor: kvm\nEOD}",
            do_utilitypool:
              "${<<EOD\n    schemaVersion: 1.0.0\n    class: Device\n    async: true\n    label: Cloudinit Onboarding\n    Common:\n      class: Tenant\n      utilityLicense:\n        class: License\n        licenseType: licensePool\n        bigIqHost: host\n        bigIqUsername: username\n        bigIqPassword: f5bigip\n        licensePool: pool\n        skuKeyword1: key\n        skuKeyword2: word\n        unitOfMeasure: null\n        reachable: false\n        hypervisor: kvm\nEOD}",
            template_file: '${file("${path.module}/f5_user_data.yaml")}',
            do_dec1: "${chomp(local.do_byol_license)}",
            do_dec2: "${local.do_dec1}",
            do_local_declaration: "${local.do_dec2}",
          },
          "it should return correct data"
        );
      });
    });
  });
});
