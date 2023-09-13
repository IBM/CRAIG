const { jsonToTf } = require("json-to-tf");
const { isNullOrEmptyString, contains } = require("lazy-z");

/**
 *
 * @param {*} exec initialized js exec promise function
 */
function cdktfController(exec) {
  /**
   * Exec Promise function used to run commands against cli
   * @param {string} command Bash command to run
   * @returns {Promise} Returns a promise to run the bash function in child processs
   */
  this.execPromise = function (command) {
    return exec(command);
  };

  /**
   * convert shell command
   * @param {*} req request object
   * @param {*} req.params
   * @param {string} req.params.language language to convert
   * @param {Object} req.body cdktf json object
   */
  this.convert = function (req) {
    return this.execPromise(
      `echo '${jsonToTf(
        JSON.stringify(req.body)
      )}' | cdktf convert --language ${req.params.language}`
    );
  };

  /**
   * convert /POST request
   * @param {*} req express request
   * @param {*} req.params
   * @param {string} req.params.language language to convert
   * @param {*} res express resolve
   * @returns {Promise} promise
   */
  this.convertPost = (req, res) => {
    if (
      !contains(["typescript", "python", "java", "csharp"], req.params.language)
    ) {
      res.status(400).send({
        error: "Unsupported language " + req.params.language,
      });
    } else {
      return this.convert(req).then((data) => {
        if (!isNullOrEmptyString(data.stderr)) {
          res.status(500).send({
            error: "CDKTF Conversion error",
            data: data,
          });
        } else res.send(data.stdout);
      });
    }
  };
}

module.exports = cdktfController;
