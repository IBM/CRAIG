const {
  titleCase,
  isNullOrEmptyString,
  getObjectFromArray,
  snakeCase,
  splat,
  isEmpty,
  eachKey,
  splatContains,
  contains,
} = require("lazy-z");
const { nameField, unconditionalInvalidText } = require("./reusable-fields");
const {
  setUnfoundResourceGroup,
  pushToChildFieldModal,
  updateSubChild,
  deleteSubChild,
} = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  resourceGroupsField,
  encryptionKeyGroups,
  hideWhenUseData,
  selectInvalidText,
  kebabCaseInput,
  titleCaseRender,
  onArrayInputChange,
  fieldIsNotWholeNumber,
  ipCidrListTextArea,
} = require("./utils");
const { invalidDescription } = require("../forms/invalid-callbacks");
const { RegexButWithWords } = require("regex-but-with-words");

/**
 * secrets manager on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.secrets_manager
 */
function secretsManagerOnStoreUpdate(config) {
  config.store.json.secrets_manager.forEach((secretsManager) => {
    setUnfoundResourceGroup(config, secretsManager);
    setKmsFromKeyOnStoreUpdate(secretsManager, config);
    if (!secretsManager.secrets) {
      secretsManager.secrets = [];
    }
    if (!secretsManager.secrets_groups) {
      secretsManager.secrets_groups = [];
    } else {
      secretsManager.secrets_groups.forEach((group) => {
        group.secrets_manager = secretsManager.name;
      });
    }
    if (!secretsManager.certificates) {
      secretsManager.certificates = [];
    } else {
      secretsManager.certificates.forEach((cert) => {
        cert.secrets_manager = secretsManager.name;
        [
          "secrets_group",
          "max_ttl",
          "ttl",
          "key_bits",
          "country",
          "organization",
          "issuer",
          "certificate_authority",
          "certificate_template",
          "key_usage",
          "ext_key_usage",
          "allowed_domains",
          "unit",
          "interval",
          "server_flag",
          "client_flag",
          "allow_subdomains",
          "description",
          "signing_method",
        ].forEach((field) => {
          if (
            config.secrets_manager?.certificates[field]?.hideWhen &&
            config.secrets_manager.certificates[field].hideWhen(cert)
          ) {
            cert[field] = contains(
              ["ext_key_usage", "key_usage", "allowed_domains"],
              field
            )
              ? []
              : contains(
                  [
                    "auto_rotate",
                    "client_flag",
                    "server_flag",
                    "allow_subdomains",
                  ],
                  field
                )
              ? false
              : null;
          } else if (
            field === "certificate_authority" &&
            cert.type === "template" &&
            !splatContains(secretsManager.certificates, "name", cert[field])
          ) {
            cert.certificate_authority = null;
          } else if (
            field === "certificate_template" &&
            cert.type === "private" &&
            !splatContains(secretsManager.certificates, "name", cert[field])
          ) {
            cert.certificate_template = null;
          } else if (
            field === "issuer" &&
            cert.type === "intermediate_ca" &&
            !splatContains(secretsManager.certificates, "name", cert[field])
          ) {
            cert.issuer = null;
          }
          if (
            field === "secrets_group" &&
            !splatContains(secretsManager.secrets_groups, "name", cert[field])
          ) {
            cert.secrets_group = null;
          }
        });
      });
    }
  });
}

/**
 * create a new secretsManager instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function secretsManagerCreate(config, stateData) {
  config.push(["json", "secrets_manager"], stateData);
}

/**
 * update existing secretsManager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerSave(config, stateData, componentProps) {
  config.store.json.clusters.forEach((cluster) => {
    cluster.opaque_secrets.forEach((secret) => {
      if (secret.secrets_manager == componentProps.data.name) {
        secret.secrets_manager = stateData.name;
      }
    });
  });
  config.updateChild(
    ["json", "secrets_manager"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete secrets manager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerDelete(config, stateData, componentProps) {
  config.carve(["json", "secrets_manager"], componentProps.data.name);
}

/**
 * hide field when cert is not a template
 * @param {*} stateData
 * @returns {boolean} true when should be hidden
 */
function hideWhenCertNotTemplate(stateData) {
  return !stateData.type || stateData.type !== "template";
}

/**
 * hide field when cert is not a private cert
 * @param {*} stateData
 * @returns {boolean} true when should be hidden
 */
function hideWhenCertNotPrivate(stateData) {
  return !stateData.type || stateData.type !== "private";
}

/**
 * hide field when cert is not a private cert
 * @param {*} stateData
 * @returns {boolean} true when should be hidden
 */
function hideWhenPrivateCert(stateData) {
  return !stateData.type || stateData.type === "private";
}

function hideWhenRootCa(stateData) {
  return !stateData.type || stateData.type === "root_ca";
}

/**
 * create secrets manager store
 * @param {*} store
 */
function initSecretsManagerStore(store) {
  store.newField("secrets_manager", {
    init: (config) => {
      config.store.json.secrets_manager = [];
    },
    onStoreUpdate: secretsManagerOnStoreUpdate,
    create: secretsManagerCreate,
    save: secretsManagerSave,
    delete: secretsManagerDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "encryption_key"],
      "secrets_manager"
    ),
    schema: {
      use_data: {
        type: "toggle",
        default: false,
        labelText: "Use Existing Instance",
      },
      name: nameField("secrets_manager"),
      resource_group: resourceGroupsField(false, {
        noHideWhen: true,
      }),
      plan: {
        type: "select",
        default: "standard",
        invalid: fieldIsNullOrEmptyString("plan"),
        invalidText: selectInvalidText("plan"),
        hideWhen: hideWhenUseData,
        groups: ["Standard", "Trial"],
        onRender: function (stateData, componentProps) {
          if (!componentProps?.data?.plan) {
            // add to plan to component props prevent button from highlighting
            // when no plan is selected
            if (componentProps.data) componentProps.data.plan = stateData.plan;
          }
          return titleCaseRender("plan")(stateData);
        },
        onInputChange: kebabCaseInput("plan"),
        tooltip: {
          content:
            "You can have one Trial instance provisioned in your account at any time. After your 30 day trial expires, functionality is removed but your instance remains available to upgrade for an additional 30 days.",
          align: "right",
          alignModal: "right",
        },
      },
      add_k8s_authorization: {
        type: "toggle",
        default: false,
        labelText: "Add Kubernetes Authorization",
        tooltip: {
          content:
            "Add an authorization to allow Kubernetes clusters to read from this Secrets Manager instance",
        },
        hideWhen: hideWhenUseData,
      },
      add_cis_authorization: {
        type: "toggle",
        default: false,
        labelText: "Add CIS Authorization",
        tooltip: {
          content:
            "Add an authorization to allow IBM Cloud Internet Services to read from this Secrets Manager instance",
        },
        hideWhen: hideWhenUseData,
      },
      encryption_key: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("encryption_key"),
        invalidText: selectInvalidText("encryption key"),
        groups: encryptionKeyGroups,
        hideWhen: hideWhenUseData,
      },
    },
    subComponents: {
      secrets_groups: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "secrets_manager",
            "secrets_groups",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "secrets_manager",
            "secrets_groups",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(
            config,
            "secrets_manager",
            "secrets_groups",
            componentProps
          );
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["name"],
          "secrets_manager",
          "secrets_groups"
        ),
        schema: {
          name: nameField("secrets_groups"),
        },
      },
      certificates: {
        shouldDisableSave: shouldDisableComponentSave(
          [
            "name",
            "type",
            "common_name",
            "secrets_group",
            "max_ttl",
            "ttl",
            "key_bits",
            "country",
            "organization",
            "issuer",
            "certificate_authority",
            "certificate_template",
            "key_usage",
            "ext_key_usage",
            "allowed_domains",
            "unit",
            "interval",
            "signing_method",
          ],
          "secrets_manager",
          "certificates"
        ),
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "secrets_manager",
            "certificates",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "secrets_manager",
            "certificates",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(
            config,
            "secrets_manager",
            "certificates",
            componentProps
          );
        },
        schema: {
          name: nameField("certificates", { size: "small" }),
          type: {
            default: "",
            size: "small",
            labelText: "Certificate Type",
            type: "select",
            groups: ["Root CA", "Intermediate CA", "Template", "Private"],
            onRender: function (stateData) {
              return titleCase(stateData.type).replace("Ca", "CA");
            },
            onInputChange: function (stateData) {
              return snakeCase(stateData.type.replace(/CA/g, "ca"));
            },
            invalid: fieldIsNullOrEmptyString("type"),
            invalidText: unconditionalInvalidText("Select a certificate type"),
          },
          common_name: {
            default: "",
            size: "small",
            invalid: function (stateData) {
              return isNullOrEmptyString(stateData.type, true) ||
                stateData.type === "template"
                ? false
                : (stateData.common_name || "").match(
                    /([a-z0-9]+\.)+[a-z0-9]+/g
                  ) === null;
            },
            invalidText: unconditionalInvalidText(
              "Common name must match the regular expression /([a-z0-9]+.)+[a-z0-9]+/g"
            ),
            hideWhen: function (stateData) {
              // hide when
              return (
                isNullOrEmptyString(stateData.type, true) ||
                stateData.type === "template"
              );
            },
          },
          max_ttl: {
            labelText: "Max TTL",
            placeholder: "365d",
            size: "small",
            invalid: function (stateData) {
              return stateData.type === "private"
                ? false
                : fieldIsNullOrEmptyString("max_ttl", true)(stateData);
            },
            invalidText: unconditionalInvalidText("Enter a valid TTL"),
            hideWhen: hideWhenPrivateCert,
          },
          secrets_group: {
            type: "select",
            size: "small",
            groups: function (stateData, componentProps) {
              let secretsManagerName = componentProps.arrayParentName;
              return splat(
                getObjectFromArray(
                  componentProps.craig.store.json.secrets_manager,
                  "name",
                  secretsManagerName
                ).secrets_groups,
                "name"
              );
            },
            invalid: function (stateData) {
              return contains(
                ["root_ca", "intermediate_ca", "template"],
                stateData.type
              )
                ? false
                : fieldIsNullOrEmptyString("secrets_group")(stateData);
            },
            invalidText: unconditionalInvalidText("Select a secrets group"),
            hideWhen: function (stateData) {
              return (
                hideWhenRootCa(stateData) ||
                contains(["root_ca", "template"], stateData.type)
              );
            },
          },
          country: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              return stateData.type === "private"
                ? false
                : (stateData.country || "").match(/^[A-Z]{1,4}$/g) === null;
            },
            invalidText: selectInvalidText(
              "Enter a valid country code. Must match regular expression /^[A-Z]{1,4}$/g"
            ),
            hideWhen: hideWhenPrivateCert,
          },
          organization: {
            size: "small",
            default: "",
            invalid: function (stateData) {
              return stateData.type === "private"
                ? false
                : fieldIsNullOrEmptyString("organization", true)(stateData);
            },
            invalidText: unconditionalInvalidText("Enter an organization name"),
            hideWhen: hideWhenPrivateCert,
          },
          key_bits: {
            size: "small",
            type: "select",
            groups: ["2048", "4096"],
            hideWhen: hideWhenPrivateCert,
          },
          description: {
            size: "wide",
            default: "",
            optional: true,
            invalid: function (stateData) {
              return invalidDescription(stateData.description || "");
            },
            invalidText: unconditionalInvalidText(
              "Invalid description. Must match the regex expression /^[a-zA-Z0-9]+$/."
            ),
            placeholder: "(Optional) Description",
            hideWhen: hideWhenRootCa,
          },
          issuer: {
            type: "select",
            size: "small",
            default: "",
            groups: function (stateData, componentProps) {
              let secretsManagerName = componentProps.arrayParentName;
              let secretsManager = getObjectFromArray(
                componentProps.craig.store.json.secrets_manager,
                "name",
                secretsManagerName
              );
              let rootCaNames = [];

              secretsManager.certificates.forEach((cert) => {
                if (
                  cert.name !== componentProps.data?.name &&
                  cert.type === "root_ca"
                ) {
                  rootCaNames.push(cert.name);
                }
              });
              return rootCaNames;
            },
            invalid: function (stateData) {
              return (
                stateData.type === "intermediate_ca" &&
                isNullOrEmptyString(stateData.issuer, true)
              );
            },
            invalidText: unconditionalInvalidText("Select an issuer"),
            hideWhen: function (stateData) {
              return stateData.type !== "intermediate_ca";
            },
          },
          server_flag: {
            type: "toggle",
            default: false,
            hideWhen: hideWhenCertNotTemplate,
            size: "small",
            labelText: "Server Flag",
          },
          client_flag: {
            type: "toggle",
            default: false,
            hideWhen: hideWhenCertNotTemplate,
            size: "small",
            labelText: "Client Flag",
          },
          allow_subdomains: {
            labelText: "Allow Subdomains",
            type: "toggle",
            default: false,
            hideWhen: hideWhenCertNotTemplate,
            size: "small",
          },
          key_usage: {
            type: "multiselect",
            size: "small",
            default: [],
            groups: [
              "DigitalSignature",
              "ContentCommitment",
              "KeyEncipherment",
              "DataEncipherment",
              "KeyAgreement",
              "CertSign",
              "CRLSign",
              "EncipherOnly",
              "DecipherOnly",
            ],
            hideWhen: hideWhenCertNotTemplate,
            invalid: function (stateData) {
              return stateData.type === "template"
                ? isEmpty(stateData.key_usage)
                : false;
            },
          },
          ext_key_usage: {
            labelText: "Extended Key Usage",
            size: "small",
            default: [],
            type: "multiselect",
            hideWhen: hideWhenCertNotTemplate,
            groups: [
              "Any",
              "ServerAuth",
              "ClientAuth",
              "CodeSigning",
              "EmailProtection",
              "IPSECEndSystem",
              "IPSECTunnel",
              "IPSECUser",
              "TimeStamping",
              "OCSPSigning",
              "MicrosoftServerGatedCrypto",
              "NetscapeServerGatedCrypto",
              "MicrosoftCommercialCodeSigning",
              "MicrosoftKernelCode",
            ],
            invalid: function (stateData) {
              return stateData.type === "template"
                ? isEmpty(stateData.ext_key_usage)
                : false;
            },
          },
          allowed_domains: {
            labelText: "Allowed Domains",
            hideWhen: hideWhenCertNotTemplate,
            size: "small",
            default: [],
            placeholder: "test.hello.com,test.world.com",
            type: "textArea",
            invalid: function (stateData) {
              if (stateData.type !== "template") {
                return false;
              } else if (stateData.allowed_domains.length === 0) {
                return true;
              }
              let incorrectDomains = false;
              stateData.allowed_domains.forEach((domain) => {
                if (
                  domain.match(
                    new RegexButWithWords()
                      .group((exp) => {
                        exp
                          .set("A-z0-9-_")
                          .set("A-z0-9-_")
                          .oneOrMore()
                          .literal(".");
                      })
                      .oneOrMore()
                      .set("A-z0-9-_")
                      .set("A-z0-9-_")
                      .oneOrMore()
                      .done("g")
                  ) === null
                ) {
                  incorrectDomains = true;
                }
              });
              return incorrectDomains;
            },
            onInputChange: ipCidrListTextArea("allowed_domains").onInputChange,
            onRender: ipCidrListTextArea("allowed_domains").onRender,
            invalidText: unconditionalInvalidText("Add at least one domain"),
            helperText: unconditionalInvalidText(
              "Enter a comma separated list of domains"
            ),
          },
          certificate_authority: {
            size: "small",
            hideWhen: hideWhenCertNotTemplate,
            type: "select",
            default: "",
            invalid: function (stateData) {
              return (
                stateData.type === "template" &&
                isNullOrEmptyString(stateData.certificate_authority, true)
              );
            },
            invalidText: selectInvalidText("Certificate Authority"),
            groups: function (stateData, componentProps) {
              let secretsManagerName = componentProps.arrayParentName;
              let secretsManager = getObjectFromArray(
                componentProps.craig.store.json.secrets_manager,
                "name",
                secretsManagerName
              );
              let rootCaNames = [];

              secretsManager.certificates.forEach((cert) => {
                if (
                  cert.name !== componentProps.data?.name &&
                  cert.type === "intermediate_ca"
                ) {
                  rootCaNames.push(cert.name);
                }
              });
              return rootCaNames;
            },
          },
          certificate_template: {
            size: "small",
            hideWhen: hideWhenCertNotPrivate,
            type: "select",
            default: "",
            invalid: function (stateData) {
              return (
                stateData.type === "private" &&
                isNullOrEmptyString(stateData.certificate_template, true)
              );
            },
            invalidText: selectInvalidText("Certificate Template"),
            groups: function (stateData, componentProps) {
              let secretsManagerName = componentProps.arrayParentName;
              let secretsManager = getObjectFromArray(
                componentProps.craig.store.json.secrets_manager,
                "name",
                secretsManagerName
              );
              let rootCaNames = [];

              secretsManager.certificates.forEach((cert) => {
                if (
                  (cert.name !== componentProps.data?.name &&
                    cert.type === "intermediate_ca" &&
                    stateData.type === "template") ||
                  (stateData.type === "private" &&
                    cert.type === "template" &&
                    cert.name !== componentProps.data?.name)
                ) {
                  rootCaNames.push(cert.name);
                }
              });
              return rootCaNames;
            },
          },
          ttl: {
            labelText: "TTL",
            placeholder: "365d",
            size: "small",
            invalid: function (stateData) {
              return stateData.type === "private"
                ? fieldIsNullOrEmptyString("ttl", true)(stateData)
                : false;
            },
            invalidText: unconditionalInvalidText("Enter a valid TTL"),
            hideWhen: hideWhenCertNotPrivate,
          },
          auto_rotate: {
            type: "toggle",
            size: "small",
            default: false,
            hideWhen: hideWhenCertNotPrivate,
            labelText: "Auto Rotate",
          },
          unit: {
            type: "select",
            size: "small",
            groups: ["day", "month", "year"],
            hideWhen: hideWhenCertNotPrivate,
            invalid: function (stateData) {
              return stateData.type === "private"
                ? fieldIsNullOrEmptyString("unit", true)(stateData)
                : false;
            },
          },
          interval: {
            size: "small",
            placeholder: "180",
            invalid: function (stateData) {
              return stateData.type === "private"
                ? fieldIsNotWholeNumber("interval", 1, 365)(stateData)
                : false;
            },
            invalitText: unconditionalInvalidText(
              "Enter a number between 1 and 365"
            ),
            hideWhen: hideWhenCertNotPrivate,
          },
          signing_method: {
            size: "small",
            groups: ["internal", "external"],
            type: "select",
            hideWhen: function (stateData) {
              return stateData.type !== "intermediate_ca";
            },
            invalid: function (stateData) {
              return stateData.type === "intermediate_ca"
                ? isNullOrEmptyString(stateData.signing_method, true)
                : false;
            },
          },
        },
      },
    },
  });
}

module.exports = {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete,
  initSecretsManagerStore,
};
