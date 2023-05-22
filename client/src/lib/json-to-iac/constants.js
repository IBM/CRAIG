let tfCommentLine =
  "##############################################################################";

module.exports = {
  endComment: "\n" + tfCommentLine,
  titleComment: `${tfCommentLine}\n# TITLE\n${tfCommentLine}`,
  versionsTf: `##############################################################################
# Terraform Providers
##############################################################################

terraform {
  required_providers {
    ibm = {
      source  = "IBM-Cloud/ibm"
      version = "~>1.52.1"
    }
$ADDITIONAL_PROVIDERS
  }
  required_version = ">=1.3"
}

##############################################################################
`,
  logdnaProviders: `    logdna = {
      source                = "logdna/logdna"
      version               = ">= 1.14.2"
      configuration_aliases = [$ALIASES]
    }
`,
  mainTf: `##############################################################################
# IBM Cloud Provider
##############################################################################

provider "ibm" {
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  ibmcloud_timeout = 60
}

#############################################################################
`,
  variablesTf: `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "$REGION"
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "$PREFIX"
}
$ADDITIONAL_VALUES
##############################################################################
`,

  teleportCloudInitText: `#cloud-config                                                                                      
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
    ) &`,
};
