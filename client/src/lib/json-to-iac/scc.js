const { jsonToTf, tfBlock } = require("./utils");

/**
 * create scc posture credential block
 * @param {Object} scc
 * @param {string} scc.id
 * @param {string} scc.passphrase
 * @param {string} scc.name
 * @returns {string} terraform formatted code
 */
function formatPostureCredential(scc) {
  return tfBlock(
    "Security and Compliance Center Credentials",
    jsonToTf("ibm_scc_posture_credential", "scc_credentials", {
      description: "^scc posture credential description",
      enabled: true,
      name: `^${scc.name}`,
      type: "^ibm_cloud",
      purpose: "^discovery_fact_collection_remediation",
      _display_fields: {
        ibm_api_key: "var.ibmcloud_api_key"
      },
      _group: {
        id: `^${scc.id}`,
        passphrase: `^${scc.passphrase}`
      }
    })
  );
}

/**
 * create scc terraforms
 * @param {Object} scc
 * @param {string} scc.location
 * @param {string} scc.collector_description
 * @param {boolean} scc.is_public
 * @param {string} scc.scope_description
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} terraform code
 */
function formatScc(scc, config) {
  let tf = "";
  tf += jsonToTf(
    "ibm_scc_account_settings",
    "ibm_scc_account_settings_instance",
    {
      _location: {
        location_id: `"${scc.location}"`
      }
    }
  ).replace(/\n(?=\s\slocation)/i, "");
  tf += jsonToTf(
    "ibm_scc_posture_collector",
    "collector",
    {
      description: `"${scc.collector_description}"`,
      is_public: scc.is_public,
      managed_by: "^ibm",
      name: `"${config._options.prefix}-scc-collector"`
    },
    config
  );
  tf += jsonToTf(
    "ibm_scc_posture_scope",
    "scc_scope",
    {
      collector_ids: `[ibm_scc_posture_collector.collector.id]`,
      credential_id: `ibm_scc_posture_credential.scc_credentials.id`,
      credential_type: `^ibm`,
      description: `^${scc.scope_description}`,
      name: `^${config._options.prefix}-scc-scope`
    },
    config
  );
  return tfBlock("Security and Compliance Center", tf);
}

/**
 * get all scc terraform
 * @param {Object} config
 * @param {Object} config.scc
 * @returns {string} terraform string
 */
function sccTf(config) {
  if (config.scc.enable)
    return (
      formatPostureCredential(config.scc) + "\n" + formatScc(config.scc, config)
    );
  else return "";
}

module.exports = {
  formatPostureCredential,
  formatScc,
  sccTf
};
