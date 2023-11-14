const { assert } = require("chai");
const {
  configureNfsServer,
} = require("../../client/src/lib/json-to-iac/sap-ansible");

describe("power vs ansible for SAP", () => {
  describe("configureOsForSap", () => {
    it("should return correct resource for ansible", () => {
      let actalData = configureNfsServer(
        {
          name: "frog",
          workspace: "workspace",
          image: "7100-05-09",
          network: [
            {
              name: "frog",
              ip_address: "",
            },
          ],
          zone: "dal12",
          pi_health_status: "OK",
          pi_proc_type: "shared",
          pi_storage_type: "",
          storage_option: "Storage Type",
          pi_storage_pool_affinity: false,
          sap: true,
          sap_profile: "ush1-4x128",
          pi_memory: "256",
          pi_processors: "4",
          ssh_key: "a",
          pi_affinity_volume: null,
          pi_anti_affinity_instance: null,
          pi_anti_affinity_volume: null,
          pi_sys_type: "e880",
        },
        {
          bastion_host: "REF-TO-BASTION-IP",
        }
      );
      let expectedData = `
resource "null_resource" "configure_nfs_workspace_frog" {
  connection {
    type         = "ssh"
    user         = "root"
    bastion_host = "REF-TO-BASTION-IP"
    private_key  = var.power_ssh_private_key_a
    agent        = false
    timeout      = "10m"
  }

  ##############################################################################
  # HANA Installation Variables
  ##############################################################################

  provisioner "file" {
    content     = <<EOF
  server_config: {"nfs":{"nfs_file_system":[{"name":"frog-sap-data-1","mount_path":"/hana/data","size":71},{"name":"frog-sap-data-2","mount_path":"/hana/data","size":71},{"name":"frog-sap-data-3","mount_path":"/hana/data","size":71},{"name":"frog-sap-data-4","mount_path":"/hana/data","size":71},{"name":"frog-sap-log-1","mount_path":"/hana/log","size":33},{"name":"frog-sap-log-2","mount_path":"/hana/log","size":33},{"name":"frog-sap-log-3","mount_path":"/hana/log","size":33},{"name":"frog-sap-log-4","mount_path":"/hana/log","size":33},{"name":"frog-sap-shared","mount_path":"/hana/shared","size":256}]}}
EOF
    destination = "/root/terraform_scripts/server_config.yml"
  }

  ##############################################################################

  ##############################################################################
  # Copy template file to target server
  ##############################################################################

  provisioner "file" {
    destination = "/root/terraform_scripts/server_config.sh"
    content = templatefile(
      "\${path.module}/templates/configure_network_services.sh.tftpl",
      {
        "ansible_playbook_name" : "power-services.yml",
        "ansible_extra_vars_path" : "/root/terraform_scripts/server_config.yml",
        "ansible_log_path" : "/root_terraform_scripts"
      }
    )
  }

  ##############################################################################

  ##############################################################################
  # Execute ansible roles
  ##############################################################################

  provisioner "remote-exec" {
    inline = [
      "chmod +x /root/terraform_scripts/server_config.sh",
      "/root/terraform_scripts/server_config.sh"
    ]
  }

  ##############################################################################
}
`;
      assert.deepEqual(
        actalData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
