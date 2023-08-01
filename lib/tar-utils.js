const { eachKey, contains, isNullOrEmptyString } = require("lazy-z");

/**
 *
 * @param {*} pack tar.pack() shortcut
 * @param {*} moduleName current directory level in tar
 * @param {*} fileMap data to write to current directory level in tar
 */
function packTar(pack, moduleName, fileMap) {
  // put top level dir
  pack.entry({ name: `${moduleName}`, type: "directory" }, "");
  // iterate current object and determine if another level is needed
  eachKey(fileMap, (file) => {
    if (!contains(file, ".")) {
      pack.entry({ name: `${moduleName}/${file}`, type: "directory" }, "");
      packTar(pack, `${moduleName}/${file}`, fileMap[file]);
    } else if (!isNullOrEmptyString(fileMap[file])) {
      // base case: not module e.g. .tf or .json file add entry
      pack.entry({ name: `${moduleName}/${file}` }, fileMap[file]);
    }
  });
}

module.exports = {
  packTar,
};
