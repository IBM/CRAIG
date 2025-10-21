const { snakeCase } = require("lazy-z");
const { jsonToTfPrint } = require("./utils");
const { getSapVolumeList } = require("../forms/sap");
const { RegexButWithWords } = require("regex-but-with-words");

/**
 * create terraform for nfs server
 * @param {*} instance instance object
 * @param {*} options options
 * @param {*} options.bastion_host reference to bastion host ip
 * @returns
 */
function configureNfsServer(instance, options) {
  /**
// template file for nfs server
#!/bin/bash

### Using input variables from terraform
playbook_name=${ansible_playbook_name}
ansible_vars_location=${ansible_extra_vars_path}
ansible_log_path=${ansible_log_path}

power_linux_sap_arr=("powervs-services.yml")

### Download and install collections from ansible-galaxy
ansible-galaxy collection install ibm.power_linux_sap:1.1.3 -f

## Execute ansible playbook
echo -e "[defaults]\nlog_path=$${ansible_log_path}/$${playbook_name}.$(date "+%Y.%m.%d-%H.%M.%S").log" >ansible.cfg

if [[ " $${power_linux_sap_arr[@]} " =~ " $${playbook_name} " ]]; then
    unbuffer ansible-playbook --connection=local -i 'localhost,' ~/.ansible/collections/ansible_collections/ibm/power_linux_sap/playbooks/$${playbook_name} --extra-vars "@$${ansible_vars_location}"
    status=$?
    [ $status -eq 0 ] && echo \"Playbook command successful\" || exit 1
fi
 */
  let serverConfig = {
    nfs: {
      nfs_file_system: [],
    },
  };
  let volumes = [];

  getSapVolumeList(
    instance.sap_profile,
    instance.workspace,
    instance.name,
    instance.zone,
  ).forEach((volume) => {
    volumes.push({
      name: volume.name,
      mount_path: volume.mount,
      size: volume.pi_volume_size,
    });
  });

  serverConfig.nfs.nfs_file_system = volumes;

  let nullResourceText = jsonToTfPrint(
    "resource",
    "null_resource",
    `configure_nfs_${instance.workspace}_${instance.name}`,
    {
      connection: [
        {
          type: "ssh",
          user: "root",
          bastion_host: options.bastion_host,
          private_key: `\${var.power_ssh_private_key_${snakeCase(
            instance.ssh_key,
          )}}`,
          agent: false,
          timeout: "10m",
        },
      ],

      provisioner: [
        {
          file: {
            content: `<<EOF\n  server_config: ${JSON.stringify(serverConfig)}
EOF`,
            destination: "/root/terraform_scripts/server_config.yml",
          },
        },
        {
          file: {
            destination: "/root/terraform_scripts/server_config.sh",
            content: `templatefile(
      "\${path.module}/templates/configure_network_services.sh.tftpl",
      {
        "ansible_playbook_name" : "power-services.yml",
        "ansible_extra_vars_path" : "/root/terraform_scripts/server_config.yml",
        "ansible_log_path" : "/root_terraform_scripts"
      }
    )`,
          },
        },
        {
          "remote-exec": {
            inline: [
              "chmod +x /root/terraform_scripts/server_config.sh",
              "/root/terraform_scripts/server_config.sh",
            ],
          },
        },
      ],
    },
  );

  // replace << notation
  return nullResourceText
    .replace('"<<EOF', "<<EOF")
    .replace('EOF"', "EOF")
    .replace(
      new RegexButWithWords()
        .literal("content")
        .whitespace()
        .oneOrMore()
        .literal("=")
        .whitespace()
        .literal('"')
        .done("g"),
      "content = ",
    )
    .replace(/\)\"/g, ")")
    .replace(
      // find first provisoner
      new RegexButWithWords()
        .whitespace()
        .whitespace()
        .wordBoundary()
        .look.ahead((exp) => {
          exp
            .literal("provisioner")
            .whitespace()
            .literal('"file"')
            .whitespace()
            .literal("{")
            .whitespace()
            .oneOrMore()
            .literal("content")
            .negatedSet("<")
            .oneOrMore()
            .literal("<");
        })
        .done("s"),
      "\n  ##############################################################################" +
        "\n  # HANA Installation Variables" +
        "\n  ##############################################################################\n\n  ",
    )
    .replace(
      // find second provisoner
      new RegexButWithWords()
        .whitespace()
        .whitespace()
        .wordBoundary()
        .look.ahead((exp) => {
          exp
            .literal("provisioner")
            .whitespace()
            .literal('"file"')
            .whitespace()
            .literal("{")
            .whitespace()
            .oneOrMore()
            .literal("destination");
        })
        .done("s"),
      "\n  ##############################################################################\n" +
        "\n  ##############################################################################" +
        "\n  # Copy template file to target server" +
        "\n  ##############################################################################\n\n  ",
    )
    .replace(
      // find remote exec provisoner
      new RegexButWithWords()
        .whitespace()
        .whitespace()
        .wordBoundary()
        .look.ahead((exp) => {
          exp.literal("provisioner").whitespace().literal('"remote-exec"');
        })
        .done("s"),
      "\n  ##############################################################################\n" +
        "\n  ##############################################################################" +
        "\n  # Execute ansible roles" +
        "\n  ##############################################################################\n\n  ",
    )
    .replace(
      // add last inline comment
      new RegexButWithWords()
        .whitespace()
        .literal("}")
        .look.ahead((exp) => {
          exp.whitespace().anyNumber().literal("}\n").stringEnd();
        })
        .done("g"),
      " }" +
        "\n\n  ##############################################################################",
    );
}

module.exports = {
  configureNfsServer,
};
