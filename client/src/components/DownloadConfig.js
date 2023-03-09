const {
  configToFilesJson
} = require("../lib/json-to-iac/config-to-files-json");
const JSZip = require("jszip");
import { saveAs } from "file-saver";

/**
 * Download configuration object
 */
export const downloadContent = json => {
  const zip = new JSZip();
  try {
    let files = configToFilesJson(json); // get files
    for (const file in files) {
      zip.file(file, files[file]); // add each file's contents to the zip
    }
    zip.generateAsync({ type: "blob" }).then(function(content) {
      // generate zip file
      saveAs(content, "craig.zip"); // Save zip file
    });
  } catch (error) {
    console.log(error);
  }
};
