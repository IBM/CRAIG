import { Docs } from "icse-react-assets";
const docs = require("../lib/docs/docs.json");

/**
 * return render docs function
 * @param {string} field json field name
 * @returns {Function} function to display docs
 */
export function RenderDocs(field) {
  return function() {
    return Docs(docs[field]);
  };
}
