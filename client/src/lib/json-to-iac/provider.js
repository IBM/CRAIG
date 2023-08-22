const { jsonToTf } = require("json-to-tf");
const { tfBlock } = require("./utils");
const { varDotRegion } = require("../constants");
const { transpose } = require("lazy-z");

/**
 * format ibm cloud provider data
 * @param {*} config config json
 * @returns {string} terraform provider string
 */
function ibmCloudProvider(config) {
  let data = {
    provider: {
      ibm: [
        {
          ibmcloud_api_key: "${var.ibmcloud_api_key}",
          region: varDotRegion,
          ibmcloud_timeout: 60
        }
      ]
    }
  };

  if (config._options.classic_resources) {
    transpose(
      {
        iaas_classic_username: "${var.iaas_classic_username}",
        iaas_classic_api_key: "${var.iaas_classic_api_key}"
      },
      data.provider.ibm[0]
    );
  }

  return tfBlock(
    "IBM Cloud Provider",
    "\n" + jsonToTf(JSON.stringify(data)) + "\n"
  );
}

module.exports = {
  ibmCloudProvider
};
