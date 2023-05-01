const { assert } = require("chai");
const {
  teleportCloudInit,
  formatTemplateCloudInit,
  formatTeleportInstance,
  teleportTf,
} = require("./teleport");

describe("teleport", () => {
  describe("teleportCloudInit", () => {
    it("should return cloud-init.tpl file", () => {
      let actualData = teleportCloudInit();
      let expectedData = `#cloud-config                                                                                      
# This file is used to install teleport on a bastion host, configure teleport with App ID, and    
# configure teleport with a COS instance.                                                         
# https://github.com/cloud-native-toolkit/terraform-vsi-bastion-teleport/blob/main/cloud-init.tpl 
packages:
  - tar
write_files:
    # writing teleport license
  - path: /root/license.pem
    permissions: "0644"
    encoding: base64
    content: \${TELEPORT_LICENSE}

    # writing https cert
  - path: /root/ca.crt
    permissions: "0644"
    encoding: base64
    content: \${HTTPS_CERT}

    # writing https key
  - path: /root/ca.key
    permissions: "0644"
    encoding: base64
    content: \${HTTPS_KEY}

    # writing teleport roles
  - path: /root/roles.yaml
    permissions: "0644"
    content: |
      # Example role
      # Add any additional ones to the end
      kind: "role"
      version: "v3"
      metadata:
        name: "teleport-admin"
      spec:
        options:
          max_connections: 3
          cert_format: standard
          client_idle_timeout: 15m
          disconnect_expired_cert: no
          enhanced_recording:
          - command
          - network
          forward_agent: true
          max_session_ttl: 1h
          port_forwarding: false
        allow:
          logins: [root]
          node_labels:
            "*": "*"
          rules:
          - resources: ["*"]
            verbs: ["*"]
      ---

    # writing oidc file to use App ID for authentication
  - path: /root/oidc.yaml
    permissions: "0644"
    content: |
      #oidc connector
      kind: oidc
      version: v2
      metadata:
        name: appid
      spec:
        redirect_url: "https://\${HOSTNAME}.\${DOMAIN}:3080/v1/webapi/oidc/callback"
        client_id: "\${APPID_CLIENT_ID}"
        display: AppID
        client_secret: "\${APPID_CLIENT_SECRET}"
        issuer_url: "\${APPID_ISSUER_URL}"
        scope: ["openid", "email"]
        claims_to_roles: 
         %{~ for claims in CLAIM_TO_ROLES ~}
          - {claim: "email", value: "\${claims.email}", roles: \${jsonencode(claims.roles)}}
         %{~ endfor ~}

    # writing configuration for teleport
  - path: /etc/teleport.yaml
    permissions: "0644"
    content: |
      #teleport.yaml
      teleport:
        nodename: \${HOSTNAME}.\${DOMAIN}
        data_dir: /var/lib/teleport
        log:
          output: stderr
          severity: DEBUG 
        storage:
          audit_sessions_uri: "s3://\${COS_BUCKET}?endpoint=\${COS_BUCKET_ENDPOINT}&region=ibm"

      auth_service:
        enabled: true
        listen_addr: 0.0.0.0:3025
        authentication:
          type: oidc
          local_auth: false
        license_file: /var/lib/teleport/license.pem
        message_of_the_day: \${MESSAGE_OF_THE_DAY}

      ssh_service:
        enabled: true
        commands:
        - name: hostname
          command: [hostname]
          period: 1m0s
        - name: arch
          command: [uname, -p]
          period: 1h0m0s

      proxy_service:
        enabled: true
        listen_addr: 0.0.0.0:3023
        web_listen_addr: 0.0.0.0:3080
        tunnel_listen_addr: 0.0.0.0:3024
        https_cert_file: /var/lib/teleport/ca.crt
        https_key_file: /var/lib/teleport/ca.key

    # writing script to start teleport
  - path: /etc/systemd/system/teleport.service
    permissions: "0644"
    content: |
      [Unit]
      Description=Teleport Service
      After=network.target

      [Service]
      Type=simple
      Restart=on-failure
      Environment=AWS_ACCESS_KEY_ID=\${HMAC_ACCESS_KEY_ID}
      Environment=AWS_SECRET_ACCESS_KEY=\${HMAC_SECRET_ACCESS_KEY_ID}
      ExecStart=/usr/local/bin/teleport start --config=/etc/teleport.yaml --pid-file=/run/teleport.pid
      ExecReload=/bin/kill -HUP $MAINPID
      PIDFile=/run/teleport.pid

      [Install]
      WantedBy=multi-user.target

    # writing script to install teleport on bastion host
  - path: /root/install.sh
    permissions: "0755"
    content: |
      #!/bin/bash
      set -x
      setup_path="/root"
      teleport_file="teleport-ent-v\${TELEPORT_VERSION}-linux-amd64-bin.tar.gz"
      teleport_url="https://get.gravitational.com/$teleport_file"

      #retrieve and extract teleport
      cd $setup_path
      curl --connect-timeout 30 --retry 15 --retry-delay 10 $teleport_url --output $teleport_file
      tar -xvzf $teleport_file

      #Copy files over
      cp $setup_path/teleport-ent/teleport /usr/local/bin/
      cp $setup_path/teleport-ent/tctl /usr/local/bin/
      cp $setup_path/teleport-ent/tsh /usr/local/bin/

      #Make the /var/lib/teleport directory
      TELEPORT_CONFIG_PATH="/var/lib/teleport"
      mkdir $TELEPORT_CONFIG_PATH

      #copy files for /root to /var/lib/
      cp $setup_path/license.pem $TELEPORT_CONFIG_PATH
      cp $setup_path/ca.crt $TELEPORT_CONFIG_PATH
      cp $setup_path/ca.key $TELEPORT_CONFIG_PATH

      sudo systemctl daemon-reload
      sudo systemctl start teleport
      sudo systemctl enable teleport

      # allow ports for firewall 
      # check if firewalld is used
      firewall-cmd -h 
      rc=$?
      if [[ $rc -eq 0 ]]; then
         systemctl stop firewalld
         sudo firewall-offline-cmd --zone=public --add-port=3023/tcp
         #sudo firewall-cmd --permanent --zone=public --add-port=3023/tcp
         sudo firewall-offline-cmd --zone=public --add-port=3080/tcp
         #sudo firewall-cmd --permanent --zone=public --add-port=3080/tcp
         systemctl start firewalld
      fi

      # check if firewalld is used
      ufw version
      rc=$?
      if [[ $rc -eq 0 ]]; then
         ufw allow 3023,3080/tcp
      fi

      #distro=$(awk '/DISTRIB_ID=/' /etc/*-release | sed 's/DISTRIB_ID=//' | tr '[:upper:]' '[:lower:]')
      #echo $distro
      #if [[ $distro == "ubuntu" ]]; then
      #    ufw allow 3023,3080/tcp
      #fi

      sleep 120
      ## Apply the oidc and role configuration
      tctl create $setup_path/roles.yaml
      tctl create $setup_path/oidc.yaml

runcmd:
    # running the script to install teleport on bastion host
  - |
    set -x
    (
      while [ ! -f /root/install.sh ]; do
        sleep 10
      done
      /root/install.sh
    ) &`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatTemplateCloudInit", () => {
    it("should create cloud init template file", () => {
      let actualData = formatTemplateCloudInit({
        deployment: "test-deployment",
        license: "TELEPORT_LICENSE",
        https_cert: "HTTPS_CERT",
        https_key: "HTTPS_KEY",
        hostname: "HOSTNAME",
        domain: "DOMAIN",
        bucket: "atracker-bucket",
        appid: "appid",
        appid_key: "b",
        message_of_the_day: "MESSAGE_OF_THE_DAY",
        version: "TELEPORT_VERSION",
        cos_key: "cos-bind-key",
        cos: "cos",
        claim_to_roles: [
          {
            email: "email@email.email",
            roles: ["role1", "role2"],
          },
          {
            email: "email2@email.email",
            roles: ["role1", "role2"],
          },
        ],
      });
      let expectedData = `##############################################################################
# Test Deployment Cloud Init
##############################################################################

locals {
  test_deployment_user_data = templatefile(
    "\${path.module}/cloud-init.tpl",
    {
      TELEPORT_LICENSE          = base64encode(tostring("TELEPORT_LICENSE"))
      HTTPS_CERT                = base64encode(tostring("HTTPS_CERT"))
      HTTPS_KEY                 = base64encode(tostring("HTTPS_KEY"))
      HOSTNAME                  = tostring("HOSTNAME")
      DOMAIN                    = tostring("DOMAIN")
      COS_BUCKET                = ibm_cos_bucket.cos_object_storage_atracker_bucket_bucket.bucket_name
      COS_BUCKET_ENDPOINT       = ibm_cos_bucket.cos_object_storage_atracker_bucket_bucket.s3_endpoint_public
      HMAC_ACCESS_KEY_ID        = ibm_resource_key.cos_object_storage_key_cos_bind_key.credentials["cos_hmac_keys.access_key_id"]
      HMAC_SECRET_ACCESS_KEY_ID = ibm_resource_key.cos_object_storage_key_cos_bind_key.credentials["cos_hmac_keys.secret_access_key"]
      APPID_CLIENT_ID           = ibm_resource_key.appid_b_key.credentials["clientId"]
      APPID_CLIENT_SECRET       = ibm_resource_key.appid_b_key.credentials["secret"]
      APPID_ISSUER_URL          = ibm_resource_key.appid_b_key.credentials["oauthServerUrl"]
      TELEPORT_VERSION          = tostring("TELEPORT_VERSION")
      MESSAGE_OF_THE_DAY        = tostring("MESSAGE_OF_THE_DAY")
      CLAIM_TO_ROLES            = [
        {
          email = "email@email.email"
          roles = ["role1","role2"]
        },
        {
          email = "email2@email.email"
          roles = ["role1","role2"]
        }
      ]
    }
  )
}

data "template_cloudinit_config" "test_deployment_cloud_init" {
  base64_encode = false
  gzip          = false
  part {
    content = local.test_deployment_user_data
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatTeleportInstance", () => {
    it("should create teleport vsi terraform", () => {
      let actualData = formatTeleportInstance(
        {
          name: "test-deployment",
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          resource_group: "slz-management-rg",
        },
        {
          _options: {
            prefix: "iac",
            region: "us-south",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_prefix: false,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: false,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
          ssh_keys: [
            {
              name: "slz-ssh-key",
              public_key: "public-key",
              resource_group: "slz-management-rg",
              use_data: false,
            },
          ],
        }
      );
      let expectedData = `##############################################################################
# Test Deployment Teleport Instance
##############################################################################

resource "ibm_is_instance" "test_deployment_teleport_vsi" {
  name           = "iac-test-deployment-teleport-vsi"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  user_data      = data.template_cloudinit_config.test_deployment_cloud_init.rendered
  tags = [
    "hello",
    "world"
  ]
  primary_network_interface {
    subnet = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }
  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn
  }
  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("teleportTf", () => {
    it("should return code for teleport instance", () => {
      let actualData = teleportTf({
        _options: {
          prefix: "iac",
          region: "us-south",
          tags: ["hello", "world"],
        },
        resource_groups: [
          {
            use_prefix: false,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: false,
            name: "slz-workload-rg",
            use_data: false,
          },
        ],
        appid: [
          {
            name: "test-appid",
            use_data: false,
            resource_group: "slz-service-rg",
            keys: [
              {
                appid: "test-appid",
                name: "test-key",
              },
              {
                appid: "test-appid",
                name: "test-key-2",
              },
            ],
          },
        ],
        ssh_keys: [
          {
            name: "slz-ssh-key",
            public_key: "public-key",
            resource_group: "slz-management-rg",
            use_data: false,
          },
        ],
        teleport_vsi: [
          {
            appid: "test-appid",
            name: "test-deployment",
            kms: "slz-kms",
            encryption_key: "slz-vsi-volume-key",
            image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
            profile: "cx2-4x8",
            security_groups: ["management-vpe-sg"],
            ssh_keys: ["slz-ssh-key"],
            subnet: "vsi-zone-1",
            vpc: "management",
            resource_group: "slz-management-rg",
            template: {
              deployment: "test-deployment",
              license: "TELEPORT_LICENSE",
              https_cert: "HTTPS_CERT",
              https_key: "HTTPS_KEY",
              hostname: "HOSTNAME",
              domain: "DOMAIN",
              cos: "cos",
              bucket: "bucket",
              cos_key: "cos_key",
              appid: "APPID_CLIENT_ID",
              appid_key: "test",
              message_of_the_day: "MESSAGE_OF_THE_DAY",
              version: "TELEPORT_VERSION",
              claim_to_roles: [
                {
                  email: "email@email.email",
                  roles: ["role1", "role2"],
                },
                {
                  email: "email2@email.email",
                  roles: ["role1", "role2"],
                },
              ],
            },
          },
        ],
      });
      let expectedData = `##############################################################################
# Test Deployment Cloud Init
##############################################################################

locals {
  test_deployment_user_data = templatefile(
    "\${path.module}/cloud-init.tpl",
    {
      TELEPORT_LICENSE          = base64encode(tostring("TELEPORT_LICENSE"))
      HTTPS_CERT                = base64encode(tostring("HTTPS_CERT"))
      HTTPS_KEY                 = base64encode(tostring("HTTPS_KEY"))
      HOSTNAME                  = tostring("HOSTNAME")
      DOMAIN                    = tostring("DOMAIN")
      COS_BUCKET                = ibm_cos_bucket.cos_object_storage_bucket_bucket.bucket_name
      COS_BUCKET_ENDPOINT       = ibm_cos_bucket.cos_object_storage_bucket_bucket.s3_endpoint_public
      HMAC_ACCESS_KEY_ID        = ibm_resource_key.cos_object_storage_key_cos_key.credentials["cos_hmac_keys.access_key_id"]
      HMAC_SECRET_ACCESS_KEY_ID = ibm_resource_key.cos_object_storage_key_cos_key.credentials["cos_hmac_keys.secret_access_key"]
      APPID_CLIENT_ID           = ibm_resource_key.appid_client_id_test_key.credentials["clientId"]
      APPID_CLIENT_SECRET       = ibm_resource_key.appid_client_id_test_key.credentials["secret"]
      APPID_ISSUER_URL          = ibm_resource_key.appid_client_id_test_key.credentials["oauthServerUrl"]
      TELEPORT_VERSION          = tostring("TELEPORT_VERSION")
      MESSAGE_OF_THE_DAY        = tostring("MESSAGE_OF_THE_DAY")
      CLAIM_TO_ROLES            = [
        {
          email = "email@email.email"
          roles = ["role1","role2"]
        },
        {
          email = "email2@email.email"
          roles = ["role1","role2"]
        }
      ]
    }
  )
}

data "template_cloudinit_config" "test_deployment_cloud_init" {
  base64_encode = false
  gzip          = false
  part {
    content = local.test_deployment_user_data
  }
}

##############################################################################

##############################################################################
# Test Deployment Teleport Instance
##############################################################################

resource "ibm_is_instance" "test_deployment_teleport_vsi" {
  name           = "iac-test-deployment-teleport-vsi"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  user_data      = data.template_cloudinit_config.test_deployment_cloud_init.rendered
  tags = [
    "hello",
    "world"
  ]
  primary_network_interface {
    subnet = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }
  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.crn
  }
  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]
}

##############################################################################

##############################################################################
# Redirect Urls
##############################################################################

resource "ibm_appid_redirect_urls" "test_deployment_appid_urls" {
  tenant_id = ibm_resource_instance.test_appid.guid
  urls = [
    "https://iac-test-deployment-teleport-vsi.DOMAIN:3080/v1/webapi/oidc/callback"
  ]
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
