const { jsonToTf } = require("json-to-tf");
const {
  snakeCase,
  transpose,
  getObjectFromArray,
  hclEncode
} = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");
const { formatAppIdRedirectUrls } = require("../client/src/lib/json-to-iac/appid");
const { teleportCloudInitText } = require("../client/src/lib/json-to-iac/constants");
const {
  tfBlock,
  tfRef,
  bucketRef,
  cdktfRef,
  jsonToTfPrint
} = require("../client/src/lib/json-to-iac/utils");
const { formatVsi } = require("../client/src/lib/json-to-iac/vsi");

function teleportCloudInit() {
  return teleportCloudInitText;
}

/**
 * get cloud init for teleport template
 * @param {*} template
 * @returns {object} terraform object
 */
function templateCloudinitConfig(template) {
  return {
    data: {
      base64_encode: false,
      gzip: false,
      part: [
        {
          content: `\${local.${snakeCase(template.deployment)}_user_data}`
        }
      ]
    },
    name: `${template.deployment} cloud init`
  };
}

/**
 * get local data for template
 * @param {*} template
 * @return {object} tf object
 */
function localTemplateUserData(template) {
  let templateData = hclEncode(
    {
      TELEPORT_LICENSE: `\${base64encode(tostring("${template.license}"))}`,
      HTTPS_CERT: `\${base64encode(tostring("${template.https_cert}"))}`,
      HTTPS_KEY: `\${base64encode(tostring("${template.https_key}"))}`,
      HOSTNAME: `\${tostring("${template.hostname}")}`,
      DOMAIN: `\${tostring("${template.domain}")}`,
      COS_BUCKET: `\${${bucketRef(
        template.cos,
        template.bucket,
        "bucket_name"
      ).replace(/\{|}|\$/g, "")}}`,
      COS_BUCKET_ENDPOINT: `\${${bucketRef(
        template.cos,
        template.bucket,
        "s3_endpoint_public"
      ).replace(/\{|}|\$/g, "")}}`,
      HMAC_ACCESS_KEY_ID: `\${${tfRef(
        "ibm_resource_key",
        `${template.cos} object storage key ${template.cos_key}`,
        'credentials["cos_hmac_keys.access_key_id"]'
      ).replace(/\{|}|\$/g, "")}}`,
      HMAC_SECRET_ACCESS_KEY_ID: `\${${tfRef(
        "ibm_resource_key",
        `${template.cos} object storage key ${template.cos_key}`,
        'credentials["cos_hmac_keys.secret_access_key"]'
      ).replace(/\{|}|\$/g, "")}}`,
      APPID_CLIENT_ID: `\${${tfRef(
        "ibm_resource_key",
        `${template.appid}-${template.appid_key}-key`,
        'credentials["clientId"]'
      ).replace(/\{|}|\$/g, "")}}`,
      APPID_CLIENT_SECRET: `\${${tfRef(
        "ibm_resource_key",
        `${template.appid}-${template.appid_key}-key`,
        'credentials["secret"]'
      ).replace(/\{|}|\$/g, "")}}`,
      APPID_ISSUER_URL: `\${${tfRef(
        "ibm_resource_key",
        `${template.appid}-${template.appid_key}-key`,
        'credentials["oauthServerUrl"]'
      ).replace(/\{|}|\$/g, "")}}`,
      TELEPORT_VERSION: `\${tostring("${template.version}")}`,
      MESSAGE_OF_THE_DAY: `\${tostring("${template.message_of_the_day}")}`,
      CLAIM_TO_ROLES: template.claim_to_roles
    },
    true
  ).replace(/\}(?=\s+\{)/g, "},");
  let spacedTemplateData = [];
  templateData.split(/\n/g).forEach(line => {
    spacedTemplateData.push(`    ` + line.replace(/("\${)|(}")/g, ""));
  });
  let localData = {
    locals: {}
  };
  localData.locals[
    snakeCase(template.deployment) + "_user_data"
  ] = `templatefile(
    "\${path.module}/cloud-init.tpl",
${spacedTemplateData.join("\n")}
  )`;
  return localData;
}

/**
 * create teleport cloud init file
 * @param {Object} template
 * @param {string} template.deployment
 * @param {string} template.license
 * @param {string} template.https_cert
 * @param {string} template.https_key
 * @param {string} template.hostname
 * @param {string} template.domain
 * @param {string} template.bucket
 * @param {string} template.bucket_endpoint
 * @param {string} template.hmac_key_id
 * @param {string} template.hmac_secret_key_id
 * @param {string} template.appid
 * @param {string} template.appid_secret
 * @param {string} template.appid_url
 * @param {string} template.message_of_the_day
 * @param {string} template.version
 * @param {Array<Object>} template.claim_to_roles
 * @param {string} template.claim_to_roles.email
 * @param {Array<string>} template.claim_to_roles.roles
 * @returns {string} terraform formatted code
 */
function formatTemplateCloudInit(template) {
  return tfBlock(
    "Test Deployment Cloud Init",
    "\n" +
      jsonToTf(JSON.stringify(localTemplateUserData(template)))
        .replace(/"templatefile/g, "templatefile")
        .replace(/\)"/g, ")") +
      "\n" +
      jsonToTfPrint(
        "data",
        "template_cloudinit_config",
        `${template.deployment} cloud init`,
        templateCloudinitConfig(template).data
      )
  );
}

/**
 * create teleport instance terraform
 * @param {Object} instance
 * @param {string} instance.name
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @returns {string} teleport instance string
 */
function formatTeleportInstance(instance, config) {
  let nameRegex = new RegexButWithWords()
    .negatedSet('"')
    .oneOrMore()
    .look.ahead(exp => {
      exp
        .literal('"\n')
        .whitespace()
        .whitespace()
        .literal("image");
    })
    .done("g");
  let addressRegex = new RegexButWithWords()
    .nonCapturingGroup('"')
    .negatedSet('"{')
    .oneOrMore()
    .look.ahead(exp => {
      exp
        .literal('"')
        .whitespace()
        .literal("{");
    })
    .done("g");
  let tf = "";
  transpose(
    {
      user_data: cdktfRef(
        `data.template_cloudinit_config.${snakeCase(
          instance.name
        )}_cloud_init.rendered`
      )
    },
    instance
  );
  tf += formatVsi(instance, config)
    .replace(addressRegex, `"${snakeCase(instance.name + " teleport vsi")}`)
    .replace(
      nameRegex,
      `${config._options.prefix}-${instance.name}-teleport-vsi`
    );
  return tfBlock(instance.name + " Teleport Instance", tf);
}

/**
 * create teleport vsi tf
 * @param {Object} config
 * @param {Array<Object>} config.teleport
 * @param {Object} config.teleport.template
 * @returns {string} teleport terraform string
 */
function teleportTf(config) {
  let tf = "";
  config.teleport_vsi.forEach(instance => {
    tf += formatTemplateCloudInit(instance.template) + "\n";
    tf += formatTeleportInstance(instance, config) + "\n";
    tf += tfBlock(
      "Redirect urls",
      formatAppIdRedirectUrls(
        getObjectFromArray(config.appid, "name", instance.appid),
        [
          `https://${config._options.prefix}-${instance.name}-teleport-vsi.${instance.template.domain}:3080/v1/webapi/oidc/callback`
        ],
        instance.name + "_appid_urls"
      )
    );
  });
  return tf;
}

module.exports = {
  teleportCloudInit,
  formatTemplateCloudInit,
  formatTeleportInstance,
  teleportTf,
  templateCloudinitConfig,
  localTemplateUserData
};
