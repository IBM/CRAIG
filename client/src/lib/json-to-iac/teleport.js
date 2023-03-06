const { snakeCase, transpose, getObjectFromArray } = require("lazy-z");
const { RegexButWithWords } = require("regex-but-with-words");
const { formatAppIdRedirectUrls } = require("./appid");
const { teleportCloudInitText, teleportConfigData } = require("./constants");
const { fillTemplate, tfBlock } = require("./utils");
const { formatVsi } = require("./vsi");

function teleportCloudInit() {
  return teleportCloudInitText;
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
  let claimToRoles = `[`;
  template.claim_to_roles.forEach(claim => {
    claimToRoles +=
      `\n        {` +
      `\n          email = "${claim.email}"` +
      `\n          roles = ${JSON.stringify(claim.roles)}` +
      `\n        },`;
  });
  return fillTemplate(teleportConfigData, {
    snake_deployment: snakeCase(template.deployment),
    license: template.license,
    https_cert: template.https_cert,
    https_key: template.https_key,
    bucket: template.bucket,
    bucket_endpoint: template.bucket_endpoint,
    hmac_key_id: template.hmac_key_id,
    hmac_secret_key_id: template.hmac_secret_key_id,
    hostname: template.hostname,
    domain: template.domain,
    appid_instance: template.appid,
    appid_url: template.appid_url,
    appid_secret: template.appid_secret,
    version: template.version,
    message_of_the_day: template.message_of_the_day,
    claim_to_roles: claimToRoles.replace(/,$/g, "")
  });
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
      user_data: `data.template_cloudinit_config.${snakeCase(
        instance.name
      )}_cloud_init.rendered`
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
          `https://${config._options.prefix}-${
            instance.name
          }-teleport-vsi.DOMAIN:3080/v1/webapi/oidc/callback`
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
  teleportTf
};
