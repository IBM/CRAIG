import { saveAs } from "file-saver";
import { contains, eachKey, isNullOrEmptyString, kebabCase } from "lazy-z";
const { configToFilesJson } = require("../../../lib");
const JSZip = require("jszip");

/**
 * Download configuration object
 * @returns (Object|undefined) error
 */
export const downloadContent = (json, projectName) => {
  const zip = new JSZip();
  try {
    let files = configToFilesJson(json); // get files
    eachKey(files, (file) => {
      // add each file's contents to the zip if it is not null or empty string
      if (isNullOrEmptyString(files[file]) === false && contains(file, "."))
        zip.file(file, files[file]);
      else if (isNullOrEmptyString(files[file]) === false) {
        zip.folder(file);
        eachKey(files[file], (subFile) => {
          zip.file(file + "/" + subFile, files[file][subFile]);
        });
      }
    });
    // File name format: <projectName>-craig-<month>-<day>-<year>-<hour>-<minute>-<PM/AM>.zip
    let now = new Date();
    let date = now.toLocaleDateString().replaceAll("/", "-");
    let time = now.toLocaleTimeString().replace(":", "-");
    time = time.split(":")[0] + "-" + time.split(" ")[1];
    let fileName = "craig-" + date + "-" + time + ".zip";
    fileName = projectName ? kebabCase(projectName) + "-" + fileName : fileName;
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // generate zip file
      saveAs(content, fileName); // Save zip file
    });
    return null;
  } catch (error) {
    console.error(error);
    return error;
  }
};
