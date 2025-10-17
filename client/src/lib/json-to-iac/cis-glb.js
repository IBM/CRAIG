const { jsonToTfPrint, tfRef, kebabName, tfBlock } = require("./utils");

/**
 * create terraform for cis origin pool
 * @param {*} pool
 * @returns {string} terraform data
 */
function formatCisOriginPool(pool) {
  let originPoolData = {
    cis_id: tfRef("ibm_cis", pool.cis + " cis"),
    name: kebabName([pool.cis, "pool", pool.name]),
    enabled: pool.enabled,
    description: pool.description,
    minimum_origins: pool.minimum_origins,
    check_regions:
      !pool.check_regions || pool.check_regions.length === 0
        ? undefined
        : pool.check_regions,
    notification_email: pool.notification_email,
  };
  pool.origins.forEach((origin) => {
    if (!originPoolData.origins) {
      originPoolData.origins = [];
    }
    delete origin.cis;
    originPoolData.origins.push(origin);
  });
  return jsonToTfPrint(
    "resource",
    "ibm_cis_origin_pool",
    pool.cis + "_cis_origin_pool_" + pool.name,
    originPoolData,
  );
}

/**
 * format cis global load balancers
 * @param {*} glb
 * @returns {string} terraform data
 */
function formatCisGlb(glb) {
  let glbData = {
    cis_id: tfRef("ibm_cis", glb.cis + " cis"),
    domain_id: tfRef(
      "ibm_cis_domain",
      glb.cis + " cis domain " + glb.domain.replace(/\./g, " "),
    ),
    name: glb.name,
    fallback_pool_id: tfRef(
      "ibm_cis_origin_pool",
      glb.cis + " cis origin pool " + glb.fallback_pool,
    ),
    enabled: glb.enabled,
    proxied: glb.proxied,
    default_pools: [],
  };
  glb.default_pools.forEach((pool) => {
    glbData.default_pools.push(
      tfRef("ibm_cis_origin_pool", glb.cis + " cis origin pool " + pool),
    );
  });
  return jsonToTfPrint(
    "resource",
    "ibm_cis_global_load_balancer",
    glb.cis + "_cis_glb_" + glb.name.replace(/\./g, " "),
    glbData,
  );
}

/**
 * format health check for cis
 * @param {*} check
 * @returns {string} terraform formatted data
 */
function formatCisHealthCheck(check) {
  return jsonToTfPrint(
    "resource",
    "ibm_cis_healthcheck",
    check.cis + "_cis_healthcheck_" + check.name,
    {
      cis: tfRef("ibm_cis", check.cis + " cis"),
      allow_insecure: check.allow_insecure,
      expected_codes: check.expected_codes,
      follow_redirects: check.follow_redirects,
      interval: check.interval,
      method: check.method,
      timeout: check.timeout,
      path: check.path,
      port: check.port,
      retries: check.retries,
      type: check.type,
    },
  );
}

/**
 * cis glb terraform
 * @param {*} config
 * @returns {string} terraform file
 */
function cisGlbTf(config) {
  let tf = "";
  if (config.cis_glbs) {
    config.cis_glbs.forEach((lb) => {
      let lbTf = "";
      lbTf += formatCisOriginPool(lb);
      lb.glbs.forEach((glb) => {
        lbTf += formatCisGlb(glb);
      });
      lb.health_checks.forEach((check) => {
        lbTf += formatCisHealthCheck(check);
      });
      tf += tfBlock("CIS Origin Pool " + lb.name, lbTf);
    });
  }
  return tf === "" ? null : tf.replace(/\n\n$/g, "\n");
}

module.exports = {
  formatCisOriginPool,
  formatCisGlb,
  formatCisHealthCheck,
  cisGlbTf,
};
