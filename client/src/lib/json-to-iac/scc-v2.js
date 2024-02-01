const { varDotPrefix } = require("../constants");
const { tfBlock, resourceRef, jsonToTfPrint, rgIdRef } = require("./utils");
const { kebabCase } = require("lazy-z");

/**
 * create resource instance for scc
 * @param {*} scc
 * @param {string} scc.resource_group
 * @param {string} scc.region
 * @param {*} config
 * @returns {object} terraform object
 */
function ibmSccInstance(scc_v2, config) {
  return {
    name: "scc_instance",
    data: {
      name: `${varDotPrefix}-scc`,
      service: "compliance",
      plan: "security-compliance-center-standard-plan",
      location: scc_v2.region,
      resource_group: rgIdRef(scc_v2.resource_group, config),
    },
  };
}

/**
 * create scc profile attachment block
 * @param {Object} scc_v2
 * @param {string} scc_v2.instance_id
 * @param {string} scc_v2.profile_id
 * @param {string} scc_v2.attachment_name
 * @param {string} scc_v2.account_id
 * @param {string} scc_v2.description
 * @param {string} scc_v2.schedule
 * @returns {object} terraform object
 */

function ibmSccProfileAttachment(profile_attachment) {
  let attachmentName = kebabCase(
    `${varDotPrefix}-scc-${profile_attachment.name}`
  );
  let profileMap = {
    "FS Cloud": "01326738-c8ca-456f-8315-e4573f534869",
    "Kubernetes Benchmark": "13c2a698-0f8d-4a7a-99c0-d325acca96ec",
    "Cloud Internet Services Benchmark": "1c13d739-e09e-4bf4-8715-dd82e4498041",
  };
  return {
    name: `${profile_attachment.name} profile attachment`,
    data: {
      name: attachmentName,
      profile_id: profileMap[profile_attachment.profile],
      description: "example description",
      instance_id: resourceRef("scc_instance", "id"),
      scope: [
        {
          environment: "ibm-cloud",
          properties: [
            {
              name: "scope_id",
              value: "${var.account_id}",
            },
          ],
          properties: [
            {
              name: "scope_type",
              value: "account",
            },
          ],
        },
      ],
      schedule: profile_attachment.schedule,
      status: "enabled",
      notifications: [
        {
          enabled: true,
          controls: [
            {
              failed_control_ids: [],
              threshold_limit: 14,
            },
          ],
        },
      ],
    },
  };
}

/**
 * create scc terraforms
 * @param {Object} scc_v2
 * @param {Array<Object>} scc_v2.profile_attachments
 * @param {string} scc_v2.location
 * @param {Object} config
 * @returns {string} terraform code
 */
function formatScc2(scc_v2, config) {
  let tf = "";
  tf += jsonToTfPrint(
    "resource",
    "ibm_resource_instance",
    "scc_instance",
    ibmSccInstance(scc_v2, config).data
  );
  scc_v2.profile_attachments.forEach((profileAttachment) => {
    let attachment = ibmSccProfileAttachment(profileAttachment, config);
    tf += jsonToTfPrint(
      "resource",
      "ibm_scc_profile_attachment",
      attachment.name,
      attachment.data
    );
  });
  return tfBlock("Security and Compliance Center", tf);
}

/**
 * get all scc terraform
 * @param {Object} config
 * @param {Object} config.scc_v2
 * @returns {string} terraform string
 */
function scc2Tf(config) {
  if (config?.scc_v2?.enable) return formatScc2(config.scc_v2, config);
  else return null;
}

module.exports = {
  formatScc2,
  scc2Tf,
  ibmSccProfileAttachment,
  ibmSccInstance,
};
