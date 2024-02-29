const {
  revision,
  transpose,
  carve,
  splat,
  contains,
  isNullOrEmptyString,
} = require("lazy-z");
const {
  resourceGroupsField,
  selectInvalidText,
  titleCaseRender,
  kebabCaseInput,
  unconditionalInvalidText,
  fieldIsNullOrEmptyString,
  shouldDisableComponentSave,
  wholeNumberField,
  wholeNumberText,
} = require("./utils");
const {
  pushToChildField,
  pushToChildFieldModal,
  updateSubChild,
  deleteSubChild,
} = require("./store.utils");
const { nameField } = require("./reusable-fields");

/**
 * init cis
 * @param {*} store
 */
function initCis(store) {
  store.newField("cis", {
    init: function (config) {
      config.store.json.cis = [];
    },
    onStoreUpdate: function (config) {
      if (config.store.json.cis) {
        config.store.json.cis.forEach((instance) => {
          instance.domains.forEach((domain) => {
            domain.cis = instance.name;
          });
          instance.dns_records.forEach((record) => {
            record.cis = instance.name;
          });
        });
      } else {
        config.store.json.cis = [];
      }
    },
    create: function (config, stateData, componentProps) {
      config.push(["json", "cis"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(["json", "cis"], componentProps.data.name, stateData);
    },
    delete: function (config, stateData, componentProps) {
      config.carve(["json", "cis"], componentProps.data.name);
    },
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "plan"],
      "cis"
    ),
    schema: {
      name: nameField("cis", { size: "small" }),
      resource_group: resourceGroupsField(true, true),
      plan: {
        type: "select",
        default: "",
        invalidText: selectInvalidText("plan"),
        groups: [
          "Standard Next",
          "Trial",
          "Enterprise Advanced",
          "Enterprise Essential",
          "Enterprise Package",
          "Enterprise Premier",
          "Enterprise Usage",
          "Global Load Balancer",
          "Security",
        ],
        onRender: titleCaseRender("plan"),
        onInputChange: kebabCaseInput("plan"),
        invalid: fieldIsNullOrEmptyString("plan"),
        size: "small",
      },
    },
    subComponents: {
      domains: {
        create: function (config, stateData, componentProps) {
          pushToChildField(config, "cis", "domains", stateData, {
            arrayParentName: componentProps.innerFormProps.arrayParentName,
          });
        },
        save: function (config, stateData, componentProps) {
          let domain = new revision(config.store.json)
            .child("cis", componentProps.arrayParentName)
            .child("domains", componentProps.data.domain, "domain").data;
          transpose(stateData, domain);
          config.update();
        },
        delete: function (config, stateData, componentProps) {
          let cis = new revision(config.store.json).child(
            "cis",
            componentProps.arrayParentName
          ).data;
          carve(cis.domains, "domain", componentProps.data.domain);
          config.update();
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["domain", "type"],
          "cis",
          "domains"
        ),
        schema: {
          domain: {
            default: "",
            invalidText: unconditionalInvalidText("Enter a valid domain"),
            placeholder: "example.com",
            invalid: function (stateData, componentProps) {
              if (
                isNullOrEmptyString(stateData.domain, true) ||
                stateData.domain.match(/^(\w+\.)+[a-z]+$/g) === null
              ) {
                return true;
              }
              let allDomains = [];
              componentProps.craig.store.json.cis.forEach((cis) => {
                cis.domains.forEach((domain) => {
                  if (domain.domain !== componentProps?.data?.domain) {
                    allDomains.push(domain.domain);
                  }
                });
              });
              return contains(allDomains, stateData.domain);
            },
          },
          type: {
            type: "select",
            default: "",
            groups: ["Full", "Partial"],
            onRender: titleCaseRender("type"),
            onInputChange: kebabCaseInput("type"),
            invalid: fieldIsNullOrEmptyString("type"),
            invalidText: selectInvalidText("type"),
          },
        },
      },
      dns_records: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "cis",
            "dns_records",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "cis",
            "dns_records",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(config, "cis", "dns_records", componentProps);
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "type", "domain", "content", "ttl"],
          "cis",
          "dns_records"
        ),
        schema: {
          name: nameField("cis_dns_record"),
          type: {
            default: "",
            labelText: "DNS Record Type",
            groups: ["A", "AAAA", "CNAME", "NS", "MX", "TXT", "CAA", "PTR"],
            type: "select",
            invalidText: selectInvalidText("record type"),
            invalid: fieldIsNullOrEmptyString("type"),
          },
          domain: {
            default: "",
            type: "select",
            invalid: fieldIsNullOrEmptyString("domain"),
            invalidText: selectInvalidText("domain"),
            groups: function (stateData, componentProps) {
              return splat(
                new revision(componentProps.craig.store.json).child(
                  "cis",
                  componentProps.arrayParentName
                ).data.domains,
                "domain"
              );
            },
          },
          ttl: {
            default: "",
            invalid: wholeNumberField("ttl", true),
            invalidText: wholeNumberText,
            labelText: "Time to Live",
            optional: true,
            placeholder: "120",
          },
          content: {
            default: "",
            invalid: fieldIsNullOrEmptyString("content"),
            invalidText: unconditionalInvalidText("Enter valid content"),
          },
        },
      },
    },
  });
}

module.exports = {
  initCis,
};
