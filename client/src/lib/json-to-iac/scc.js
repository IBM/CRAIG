const { varDotPrefix } = require("../constants");
const { tfBlock, cdktfRef, jsonToTfPrint } = require("./utils");

/**
 * create scc posture credential block
 * @param {Object} scc
 * @param {string} scc.id
 * @param {string} scc.passphrase
 * @param {string} scc.name
 * @returns {string} terraform formatted code
 */

function ibmSccPostureCredential(scc) {
  return {
    name: "scc credentials",
    data: {
      description: "scc posture credential description",
      enabled: true,
      name: scc.name,
      type: "ibm_cloud",
      purpose: "discovery_fact_collection_remediation",
      display_fields: [
        {
          ibm_api_key: cdktfRef("var.ibmcloud_api_key")
        }
      ],
      group: [
        {
          id: scc.id,
          passphrase: scc.passphrase
        }
      ]
    }
  };
}

/**
 * create scc posture credential block
 * @param {Object} scc
 * @param {string} scc.id
 * @param {string} scc.passphrase
 * @param {string} scc.name
 * @returns {string} terraform formatted code
 */
function formatPostureCredential(scc) {
  let cred = ibmSccPostureCredential(scc);
  return tfBlock(
    "Security and Compliance Center Credentials",
    jsonToTfPrint(
      "resource",
      "ibm_scc_posture_credential",
      cred.name,
      cred.data
    )
  );
}

/**
 * create account settings
 * @param {*} scc
 * @returns {object} terraform object
 */
function ibmSccAccountSettings(scc) {
  return {
    name: "ibm_scc_account_settings_instance",
    data: {
      location: [
        {
          location_id: scc.location
        }
      ]
    }
  };
}

/**
 * create posture collector
 * @param {*} scc
 * @param {*} config
 * @returns {object} terraform object
 */
function ibmSccPostureCollector(scc, config) {
  return {
    name: "collector",
    data: {
      description: scc.collector_description,
      is_public: scc.is_public,
      managed_by: "ibm",
      name: `${varDotPrefix}-scc-collector`
    }
  };
}

/**
 * create scope
 * @param {*} scc
 * @param {*} config
 * @returns {object} terraform object
 */
function ibmSccPostureScope(scc, config) {
  return {
    name: "scc_scope",
    data: {
      collector_ids: [cdktfRef("ibm_scc_posture_collector.collector.id")],
      credential_id: cdktfRef(`ibm_scc_posture_credential.scc_credentials.id`),
      credential_type: `ibm`,
      description: scc.scope_description,
      name: `${varDotPrefix}-scc-scope`
    }
  };
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
  let settings = ibmSccAccountSettings(scc);
  tf += jsonToTfPrint(
    "resource",
    "ibm_scc_account_settings",
    settings.name,
    settings.data
  );
  tf += jsonToTfPrint(
    "resource",
    "ibm_scc_posture_collector",
    "collector",
    ibmSccPostureCollector(scc, config).data
  );
  tf += jsonToTfPrint(
    "resource",
    "ibm_scc_posture_scope",
    "scc_scope",
    ibmSccPostureScope(scc, config).data
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
  sccTf,
  ibmSccPostureCredential,
  ibmSccAccountSettings,
  ibmSccPostureScope,
  ibmSccPostureCollector
};
