const {
  splatContains,
  splat,
  isNullOrEmptyString,
  revision,
  isEmpty,
  contains,
} = require("lazy-z");
const {
  pushToChildFieldModal,
  updateSubChild,
  deleteSubChild,
} = require("./store.utils");
const {
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  unconditionalInvalidText,
  fieldIsNotWholeNumber,
  invalidIpv4Address,
  invalidIpv4AddressText,
  selectInvalidText,
  timeToLive,
} = require("./utils");
const { invalidNameText, invalidName } = require("../forms");
const { invalidDescription } = require("../forms/invalid-callbacks");
const { RegexButWithWords } = require("regex-but-with-words");
const { domainValidationExp } = require("../constants");

/**
 * get list of cis pool names
 * @param {*} stateData
 * @returns {Array<string>} list of pool names
 */
function cisPoolNames(stateData, componentProps) {
  return splat(componentProps.craig.store.json.cis_glbs, "name");
}

/**
 * init cis glb store
 * @param {*} store
 */
function initCisGlbStore(store) {
  store.newField("cis_glbs", {
    init: function (config) {
      config.store.json.cis_glbs = [];
    },
    onStoreUpdate: function (config) {
      if (!config.store.json.cis_glbs) {
        config.store.json.cis_glbs = [];
      } else {
        config.store.json.cis_glbs.forEach((glb) => {
          if (!splatContains(config.store.json.cis, "name", glb.cis)) {
            glb.cis = null;
          }
          // add cis to each child
          ["origins", "glbs", "health_checks"].forEach((field) => {
            if (!glb[field]) {
              glb[field] = [];
            }
            glb[field].forEach((item) => {
              item.cis = glb.cis;
            });
          });
        });
      }
    },
    create: function (config, stateData) {
      config.push(["json", "cis_glbs"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "cis_glbs"],
        componentProps.data.name,
        stateData
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(["json", "cis_glbs"], componentProps.data.name);
    },
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "cis", "description", "minimum_origins"],
      "cis_glbs"
    ),
    schema: {
      name: {
        default: "",
        invalid: invalidName("cis_glbs"),
        invalidName: invalidNameText("cis_glbs"),
      },
      cis: {
        labelText: "CIS Instance",
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("cis"),
        invalidText: unconditionalInvalidText("Select a CIS instance"),
        groups: function (stateData, componentProps) {
          return splat(componentProps.craig.store.json.cis, "name");
        },
      },
      enabled: {
        type: "toggle",
        labelText: "Enabled",
        default: true,
      },
      description: {
        labelText: "Description",
        type: "textArea",
        default: "",
        invalid: function (stateData) {
          return invalidDescription(stateData.description);
        },
        invalidText: unconditionalInvalidText(
          "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/."
        ),
        placeholder: "(Optional) CIS Global Load Balancer Description",
      },
      minimum_origins: {
        default: "1",
        placeholder: "1",
        optional: true,
        tooltip: {
          alignModal: "right",
          content:
            "The minimum number of origins that must be healthy for this pool to serve traffic. If the number of healthy origins falls within this number, the pool will be marked unhealthy and we will failover to the next available pool.",
        },
        invalid: fieldIsNotWholeNumber("minimum_origins", 1, 100),
        invalidText: unconditionalInvalidText(
          "Must be a whole number greater than 1"
        ),
      },
      notification_email: {
        default: "",
        placeholder: "email@example.com",
        optional: true,
        invalid: function (stateData) {
          let emailRegex = new RegexButWithWords()
            .stringBegin()
            .set("A-z0-9")
            .set("A-z0-9-_")
            .oneOrMore()
            .group((exp) => {
              exp.literal(".").set("A-z0-9-_").anyNumber().set("A-z0-9");
            })
            .anyNumber()
            .literal("@")
            .set("A-z0-9-_")
            .oneOrMore()
            .group((exp) => {
              exp.literal(".").set("A-z0-9-_").anyNumber().set("A-z0-9");
            })
            .oneOrMore()
            .stringEnd()
            .done("g");
          return isNullOrEmptyString(stateData.notification_email, true)
            ? false
            : stateData.notification_email.match(emailRegex) === null;
        },
      },
    },
    subComponents: {
      origins: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "cis_glbs",
            "origins",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "cis_glbs",
            "origins",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(config, "cis_glbs", "origins", componentProps);
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "address"],
          "cis_glbs",
          "origins"
        ),
        schema: {
          name: {
            default: "",
            invalid: invalidName("origins"),
            invalidText: invalidNameText("origins"),
          },
          address: {
            default: "",
            placeholder: "X.X.X.X",
            invalid: invalidIpv4Address("address"),
            invalidText: invalidIpv4AddressText,
          },
          enabled: {
            type: "toggle",
            labelText: "Enabled",
            default: true,
          },
        },
      },
      glbs: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "cis_glbs",
            "glbs",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(config, "cis_glbs", "glbs", stateData, componentProps);
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(config, "cis_glbs", "glbs", componentProps);
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["domain", "fallback_pool", "default_pools", "ttl", "name"],
          "cis_glbs",
          "glbs"
        ),
        schema: {
          domain: {
            default: "",
            type: "select",
            invalid: fieldIsNullOrEmptyString("domain"),
            invalidText: selectInvalidText("domain"),
            groups: function (stateData, componentProps) {
              let cis = new revision(componentProps.craig.store.json).child(
                "cis_glbs",
                componentProps.arrayParentName
              ).data.cis;
              return splat(
                new revision(componentProps.craig.store.json).child("cis", cis)
                  .data.domains,
                "domain"
              );
            },
          },
          fallback_pool: {
            default: "",
            type: "select",
            invalid: fieldIsNullOrEmptyString("fallback_pool"),
            invalidText: selectInvalidText("fallback pool"),
            groups: cisPoolNames,
          },
          default_pools: {
            default: [],
            type: "multiselect",
            invalid: function (stateData) {
              return isEmpty(stateData.default_pools);
            },
            invalidText: unconditionalInvalidText("Select at least one pool"),
            groups: cisPoolNames,
          },
          enabled: {
            type: "toggle",
            labelText: "Enabled",
            default: true,
          },
          proxied: {
            type: "toggle",
            labelText: "Proxied",
            default: false,
          },
          ttl: timeToLive(),
          name: {
            default: "",
            invalid: function (stateData, componentProps) {
              if (
                isNullOrEmptyString(stateData.name, true) ||
                stateData.name.match(domainValidationExp) === null
              ) {
                return true;
              } else {
                let allGlbNames = [];
                componentProps.craig.store.json.cis_glbs.forEach((glb) => {
                  allGlbNames = allGlbNames.concat(
                    splat(glb.glbs, "name").filter((name) => {
                      if (
                        !componentProps.data ||
                        name !== componentProps.data.name
                      )
                        return name;
                    })
                  );
                });
                return contains(allGlbNames, stateData.name);
              }
            },
            invalidText: function (stateData) {
              if (
                isNullOrEmptyString(stateData.name, true) ||
                stateData.name.match(domainValidationExp) === null
              ) {
                return "Enter a valid domain name";
              } else return `Name ${stateData.name} in use`;
            },
          },
        },
      },
      health_checks: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "cis_glbs",
            "health_checks",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "cis_glbs",
            "health_checks",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(config, "cis_glbs", "health_checks", componentProps);
        },
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "port",
            "path",
            "interval",
            "retries",
            "type",
            "timeout",
            "method",
            "expected_codes",
          ],
          "cis_glbs",
          "health_checks"
        ),
        schema: {
          name: {
            size: "small",
            default: "",
            invalid: invalidName("health_checks"),
            invalidText: invalidNameText("health_checks"),
          },
          allow_insecure: {
            size: "small",
            type: "toggle",
            labelText: "Allow Insecure",
            default: false,
            tooltip: {
              alignModal: "right",
              content:
                "If set to true, the certificate is not validated when the health check uses HTTPS. If set to false, the certificate is validated, even if the health check uses HTTPS",
            },
          },
          follow_redirects: {
            size: "small",
            type: "toggle",
            labelText: "Follow Redirects",
            default: false,
            tooltip: {
              content:
                "If set to true, a redirect is followed when a redirect is returned by the origin pool. Is set to false, redirects from the origin pool are not followed",
            },
          },
          expected_codes: {
            size: "small",
            default: "",
            placeholder: "200",
            invalid: fieldIsNotWholeNumber("expected_codes", 200, 600),
            invalidText: unconditionalInvalidText(
              "Expected codes should be a whole number between 200 and 600"
            ),
          },
          method: {
            size: "small",
            default: "",
            type: "select",
            invalid: fieldIsNullOrEmptyString("method"),
            invalidText: selectInvalidText("method"),
            groups: ["GET", "PUT", "POST", "PATCH", "DELETE"],
          },
          timeout: {
            size: "small",
            default: "",
            labelText: "Timeout (Seconds)",
            invalid: fieldIsNotWholeNumber("timeout", 5, 200),
            invalidText: unconditionalInvalidText(
              "Enter a whole number between 5 and 200"
            ),
          },
          interval: {
            size: "small",
            default: "",
            labelText: "Check Interval (Seconds)",
            invalid: fieldIsNotWholeNumber("interval", 60, 600),
            invalidText: unconditionalInvalidText(
              "Enter a whole number between 60 and 600"
            ),
          },
          path: {
            size: "small",
            default: "",
            tooltip: {
              content: "Endpoint path for health check",
            },
            placeholder: "/",
            invalid: fieldIsNullOrEmptyString("path"),
            invalidText: unconditionalInvalidText("Enter a path"),
          },
          port: {
            size: "small",
            default: "",
            labelText: "Healthcheck TCP Port",
            invalid: fieldIsNotWholeNumber("port", 1, 65535),
            invalidText: unconditionalInvalidText(
              "Enter a whole number between 1 and 65535"
            ),
            placeholder: "443",
          },
          type: {
            size: "small",
            default: "",
            type: "select",
            groups: ["http", "https"],
            invalid: fieldIsNullOrEmptyString("type"),
            invalidText: selectInvalidText("type"),
          },
          retries: {
            size: "small",
            default: "",
            placeholder: "2",
            invalid: fieldIsNotWholeNumber("retries", 2, 10),
            invalidText: unconditionalInvalidText(
              "Enter a whole number between 2 and 10"
            ),
          },
        },
      },
    },
  });
}

module.exports = {
  initCisGlbStore,
};
