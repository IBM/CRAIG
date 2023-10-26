const { clusterRoutes } = require("./cluster-api");
const { schematicsRoutes } = require("./schematics-api");
const { vsiRoutes } = require("./vsi-api");
const { powerRoutes } = require("./power-api");

/**
 * controller constructor
 * @param {*} axios initialized axios package
 */
function controller(axios) {
  this.token = null; // access token
  this.expiration = null; // token expiration
  this.versions = []; // list of kube versions
  this.flavors = []; // list of kube flavors
  this.instanceProfiles = []; // list of vsi instance profiles
  this.images = []; // list of vsi images
  this.uploadResponse = null;
  this.clusterRoutes = clusterRoutes(axios, this);
  this.vsiRoutes = vsiRoutes(axios, this);
  this.schematicsRoutes = schematicsRoutes(axios, this);
  this.powerRoutes = powerRoutes(axios, this);

  /**
   * check if a token is expired
   * @returns {boolean} true if expired
   */
  this.tokenIsExpired = () => {
    return !this.expiration || !this.token
      ? true
      : this.expiration <= Math.floor(Date.now() / 1000);
  };

  /**
   * send data from constructor when a valid token and data are found
   * by using this we can cut down on the number of needed api calls by
   * storing the data locally for a small period of time
   * @param {*} res express resolve object
   * @param {string} field name of local data store
   * @param {Promise} callback promise to return
   * @returns {Promise} promise to return data
   */
  this.sendDataOnTokenValid = (res, field, callback) => {
    if (this.tokenIsExpired() === false && this[field].length > 0) {
      return this.passThroughPromise(res, this[field]);
    } else {
      return callback();
    }
  };

  /**
   * pass through promise function to resolve when no api call needed
   * @param {*} res express resolve
   * @param {*} value arbitrary value
   * @returns {Promise}
   */
  this.passThroughPromise = (res, value) => {
    return new Promise((resolve, reject) => {
      resolve();
    }).then(() => {
      res.send(value);
    });
  };

  /**
   * get authorization token to use ibmcloud api
   * @return {string} returns an access token
   */
  this.getBearerToken = () => {
    return new Promise((resolve, reject) => {
      if (!process.env.API_KEY) {
        let error = new Error("No API_KEY defined");
        reject(error);
      } else if (this.tokenIsExpired()) {
        // send request to IBM Cloud IAM endpoint to get access token if no token present or if expired
        let requestConfig = {
          method: "post",
          url: `https://iam.cloud.ibm.com/identity/token?grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${process.env.API_KEY}`,
          headers: {
            Accept: "application/json",
          },
        };
        axios(requestConfig)
          .then((response) => {
            this.token = response.data.access_token;
            this.expiration = response.data.expiration;
            resolve(response.data.access_token);
          })
          .catch((error) => {
            this.expiration = undefined;
            reject(error);
          });
      } else {
        // token present and not expired
        resolve(this.token);
      }
    }).catch((err) => {
      return err;
    });
  };
}
module.exports = controller;
