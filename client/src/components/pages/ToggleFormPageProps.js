import { splat, transpose, eachKey } from "lazy-z";
import { RenderDocs } from "./SimplePages";
import {
  invalidIamAccountSettings,
  iamAccountSettingInvalidText,
  disableSave,
  genericNameCallback,
  invalidName,
  propsMatchState,
  newF5Vsi
} from "../../lib";
import {
  AtrackerForm,
  SccForm,
  IamAccountSettingsForm,
  F5VsiForm
} from "icse-react-assets";
import { forceShowForm } from "../../lib";
import { F5Form } from "../forms/";
import { invalidF5Vsi } from "../../lib/forms";
import { f5Images } from "../../lib/json-to-iac";

const pathToFormMap = {
  activityTracker: {
    jsonField: "atracker",
    docsField: "atracker",
    name: "Activity Tracker",
    innerForm: AtrackerForm
  },
  securityComplianceCenter: {
    jsonField: "scc",
    docsField: "security_compliance_center",
    name: "Security and Compliance Center",
    innerForm: SccForm
  },
  iamAccountSettings: {
    jsonField: "iam_account_settings",
    docsField: "iam_account_settings",
    name: "IAM Account Settings",
    innerForm: IamAccountSettingsForm
  },
  f5BigIP: {
    jsonField: "f5_vsi",
    docsField: "f5",
    name: "F5 VSI",
    innerForm: F5VsiForm
  }
};

function none() {}

function toggleFormProps(form, craig) {
  // fields act differently for f5, don't use defaults
  if (form === "f5") {
    let props = {
      craig: craig,
      name: "Configure F5 Big IP",
      noSaveButton: true,
      submissionFieldName: "f5_vsi",
      about: RenderDocs("f5")(),
      innerForm: F5Form,
      hideName: true,
      noDeleteButton: true,
      tabPanel: {
        name: "F5 Big IP"
      },
      propsMatchState: propsMatchState,
      disableSave: disableSave,
      hide: true,
      nullRef: true,
      innerFormProps: {
        craig: craig,
        disableSave: disableSave,
        propsMatchState: propsMatchState,
        templateInnerFormProps: {
          invalidCallback: invalidF5Vsi,
          invalidTextCallback: none, // all fields can use default field invalid text
          disableSave: disableSave,
          propsMatchState: propsMatchState
        },
        deploymentInnerFormProps: {
          craig: craig,
          vsis: craig.store.json.f5_vsi || [],
          sshKeys: craig.store.sshKeys,
          edge_pattern: craig.store.edge_pattern,
          f5_on_management: craig.store.edge_vpc_name === "management",
          apiEndpointInstanceProfiles: `/api/vsi/${craig.store.json._options.region}/instanceProfiles`,
          resourceGroups: splat(craig.store.json.resource_groups, "name"),
          encryptionKeys: craig.store.encryptionKeys,
          f5Images: Object.keys(f5Images().public_image_map),
          initVsiCallback: newF5Vsi,
          saveVsiCallback: craig.f5.instance.save,
          disableSaveCallback: propsMatchState,
          hideSaveCallback: none, // not hiding save
          propsMatchState: propsMatchState
        }
      }
    };
    if (craig.store.json.f5_vsi.length > 0) {
      // pass in defaults if instances exist
      props.innerFormProps.deploymentInnerFormProps.data = {
        resource_group: craig.store.json.f5_vsi[0].resource_group,
        ssh_keys: craig.store.json.f5_vsi[0].ssh_keys,
        image: /f5-bigip-(15-1-5-1-0-0-14|16-1-2-2-0-0-28)-(ltm|all)-1slot/.exec(
          craig.store.json.f5_vsi[0].image
        )[0], // keep only image name in props
        profile: craig.store.json.f5_vsi[0].profile,
        zones: craig.store.json.f5_vsi.length
      };
      props.innerFormProps.templateInnerFormProps.data =
        craig.store.json.f5_vsi[0].template;
    } else {
      props.innerFormProps.deploymentInnerFormProps.data = {
        zones: craig.store.json.f5_vsi.length
      };
    }
    return props;
  }
  // default props for all forms
  let formFields = pathToFormMap[form];
  let jsonField = pathToFormMap[form].jsonField;
  let docsField = pathToFormMap[form].docsField;
  let formTemplate = {
    craig: craig,
    name: formFields.name,
    onSave: craig[jsonField].save,
    submissionFieldName: jsonField,
    about: RenderDocs(docsField)(),
    propsMatchState: propsMatchState,
    disableSave: disableSave,
    innerForm: formFields.innerForm,
    hideName: true,
    noDeleteButton: true,
    tabPanel: {
      name: formFields.name
    },
    hide: true,
    innerFormProps: {
      craig: craig
    },
    forceOpen: forceShowForm
  };

  if (form === "activityTracker") {
    // set specific props
    let atrackerInnerFormProps = {
      region: craig.store.json._options.region,
      data: craig.store.json.atracker,
      prefix: craig.store.json._options.prefix,
      resourceGroups: splat(craig.store.json.resource_groups, "name"),
      cosBuckets: craig.store.cosBuckets,
      cosKeys: craig.store.cosKeys
    };
    transpose(atrackerInnerFormProps, formTemplate.innerFormProps);
    formTemplate.tabPanel.name = "Activity Tracker";
    formTemplate.name = `${craig.store.json._options.prefix}-atracker`;
  } else if (form === "securityComplianceCenter") {
    // set specific props
    formTemplate.useAddButton = craig.store.json.scc.enable === false;
    formTemplate.noDeleteButton = craig.store.json.scc.enable === false;
    formTemplate.onDelete = craig[jsonField].delete;
    let sccData = { ...craig.store.json.scc };
    eachKey(sccData, key => {
      if (sccData[key] === null) {
        sccData[key] = "";
      }
    });
    let sccInnerFormProps = {
      data: sccData,
      invalidCallback: invalidName("scc"),
      invalidTextCallback: () => {
        return genericNameCallback();
      }
    };
    transpose(sccInnerFormProps, formTemplate.innerFormProps);
  } else if (form === "iamAccountSettings") {
    // set specific props
    formTemplate.onDelete = craig[jsonField].delete;
    formTemplate.useAddButton =
      craig.store.json.iam_account_settings.enable === false;
    let data = { ...craig.store.json.iam_account_settings };
    let iamInnerFormProps = {
      data: data,
      invalidCallback: invalidIamAccountSettings,
      invalidTextCallback: iamAccountSettingInvalidText
    };
    transpose(iamInnerFormProps, formTemplate.innerFormProps);
  }

  return formTemplate;
}

export default toggleFormProps;
