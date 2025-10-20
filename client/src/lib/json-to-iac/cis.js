const { isNullOrEmptyString } = require("lazy-z");
const {
  jsonToTfPrint,
  kebabName,
  rgIdRef,
  timeouts,
  tfRef,
  tfBlock,
} = require("./utils");

/**
 * format CIS instance tf
 * @param {*} cis
 * @param {*} config
 * @returns {string} string formatted terraform
 */
function formatCis(cis, config) {
  // valid plans ["standard-next", "trial"]
  return jsonToTfPrint("resource", "ibm_cis", cis.name + "_cis", {
    name: kebabName([cis.name]),
    plan: cis.plan,
    resource_group_id: rgIdRef(cis.resource_group, config),
    location: "global",
    tags: config._options.tags,
    timeouts: timeouts("15m", "15m", "15m"),
  });
}

/**
 * create domain
 * @param {*} cis
 * @returns {string} terraform formatted string
 */
function formatCisDomain(domain) {
  // valid domain types ["full", "partial"]
  return jsonToTfPrint(
    "resource",
    "ibm_cis_domain",
    domain.cis + " cis domain " + domain.domain.replace(/\./g, "-"),
    {
      domain: domain.domain,
      cis_id: tfRef("ibm_cis", domain.cis + " cis"),
      type: domain.type,
    },
  );
}

/**
 * create dns record
 * @param {*} record
 * @returns {string} terraform formatted string
 */
function formatCisDnsRecord(record) {
  // record ["A", "AAAA", "CNAME", "NS", "MX", "TXT", "LOC", "SRV", "CAA", "PTR"]
  // LOC and SRV records require a lot of extra params and are not needed so we
  // will not support until there is a need
  return jsonToTfPrint(
    "resource",
    "ibm_cis_dns_record",
    record.cis + " cis dns record " + record.domain.replace(/\./g, "-"),
    {
      cis_id: tfRef("ibm_cis", record.cis + " cis"),
      domain: tfRef(
        "ibm_cis_domain",
        record.cis + " cis domain " + record.domain.replace(/\./g, "-"),
        "domain_id",
      ),
      name: record.name,
      type: record.type,
      content: record.content,
      ttl: isNullOrEmptyString(record.ttl) ? undefined : record.ttl,
    },
  );
}

/**
 * cis terraform
 * @param {*} config
 * @returns {string}
 */
function cisTf(config) {
  let cisTf = "";
  if (config.cis)
    config.cis.forEach((cis) => {
      let instanceTf = formatCis(cis, config);
      cis.domains.forEach((domain) => {
        instanceTf += formatCisDomain(domain);
      });
      cis.dns_records.forEach((record) => {
        instanceTf += formatCisDnsRecord(record);
      });
      cisTf +=
        tfBlock(`${cis.name} Cloud Internet Services`, instanceTf) + "\n";
    });
  return cisTf === "" ? null : cisTf.replace(/\n\n$/g, "\n");
}

module.exports = {
  formatCis,
  formatCisDomain,
  formatCisDnsRecord,
  cisTf,
};
