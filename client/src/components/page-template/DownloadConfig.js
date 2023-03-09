const { configToFilesJson } = require("../../lib/json-to-iac");
const JSZip = require("jszip");
import { saveAs } from "file-saver";
import { eachKey, isNullOrEmptyString } from "lazy-z";

/**
 * Download configuration object
 */
export const downloadContent = json => {
  const zip = new JSZip();
  try {
    let files = configToFilesJson(json); // get files
    eachKey(files, file => {
      // add each file's contents to the zip if it is not null or empty string
      if (isNullOrEmptyString(files[file]) === false)
        zip.file(file, files[file]);
    });
    zip.generateAsync({ type: "blob" }).then(function(content) {
      // generate zip file
      saveAs(content, "craig.zip"); // Save zip file
    });
  } catch (error) {
    console.log(error);
  }
};
