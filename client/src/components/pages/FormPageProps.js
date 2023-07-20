import {
  AccessGroupForm,
  SshKeyForm,
  VpeForm,
  VpnGatewayForm,
  VsiLoadBalancerForm,
  VpnServerForm,
} from "icse-react-assets";
import { splat, transpose } from "lazy-z";
import {
  disableSave,
  forceShowForm,
  invalidName,
  invalidNameText,
  invalidSshPublicKey,
  accessGroupPolicyHelperTextCallback,
  propsMatchState,
  invalidIdentityProviderURI,
  disableSshKeyDelete,
  setFormRgList,
  defaultFormTemplate,
  setFormVpcList,
  setFormEncryptionKeyList,
  setFormSubnetList,
  setDeleteDisabledMessage,
  invalidCidrBlock,
  setFormSgList,
} from "../../lib";
import NaclForm from "../forms/NaclForm";
import SubnetForm from "../forms/SubnetForm";
import { RenderDocs } from "./SimplePages";
import { invalidCrnList } from "../../lib/forms";
import { NoSecretsManagerTile } from "../utils/NoSecretsManagerTile";

const pathToFormMap = {
  accessGroups: {
    jsonField: "access_groups",
    name: "Access Groups",
    addText: "Create an Access Group",
    innerForm: AccessGroupForm,
  },
  sshKeys: {
    jsonField: "ssh_keys",
    name: "SSH Keys",
    addText: "Create an SSH Key",
    innerForm: SshKeyForm,
  },
  vpe: {
    jsonField: "virtual_private_endpoints",
    name: "Virtual Private Endpoints",
    addText: "Create a VPE",
    innerForm: VpeForm,
  },
  lb: {
    jsonField: "load_balancers",
    name: "VPC Load Balancers",
    addText: "Create a Load Balancer",
    innerForm: VsiLoadBalancerForm,
  },
  vpnServers: {
    jsonField: "vpn_servers",
    name: "VPN Servers",
    addText: "Create a VPN Server",
    innerForm: VpnServerForm,
  },
};
/**
 * create form template props for form page
 * @param {string} form form name
 * @param {lazyZstate} craig
 * @returns {Object} form template props
 */
function formProps(form, craig) {
  function none() {}

  if (form === "nacls" || form === "subnets") {
    let innerFormData = {
      name: form === "nacls" ? "Network Access Control Lists" : "VPC Subnets",
      innerForm: form === "nacls" ? NaclForm : SubnetForm,
      arrayData: craig.store.json.vpcs,
      docs: form === "nacls" ? RenderDocs("acls") : RenderDocs("subnets"),
      onSubmit: none,
      onDelete: none,
      onSave: none,
      disableSave: none,
      propsMatchState: none,
      forceOpen: forceShowForm,
      hideFormTitleButton: true,
      innerFormProps: {
        craig: craig,
      },
      toggleFormProps: {
        craig: craig,
        noDeleteButton: true,
        noSaveButton: true,
        hideName: true,
        hide: true,
        submissionFieldName: form === "nacls" ? "network_acls" : "subnetTiers",
        disableSave: none,
        propsMatchState: none,
        nullRef: true,
      },
    };
    return innerFormData;
  }

  let formFields = pathToFormMap[form];
  let jsonField = pathToFormMap[form].jsonField;
  let formTemplate = defaultFormTemplate(formFields, jsonField, craig);
  formTemplate.docs = RenderDocs(jsonField);
  setFormRgList(form, formTemplate, craig);
  setFormVpcList(form, formTemplate, craig);
  setFormEncryptionKeyList(form, formTemplate, craig);
  setFormSubnetList(form, formTemplate, craig);
  setDeleteDisabledMessage(form, formTemplate);
  setFormSgList(form, formTemplate, craig);

  if (form === "vpe") {
    formTemplate.innerFormProps.secretsManagerInstances = splat(
      craig.store.json.secrets_manager,
      "name"
    );
  }

  if (form === "vpnServers") {
    if (craig.store.json.secrets_manager.length === 0) {
      formTemplate.hideFormTitleButton = true;
      formTemplate.overrideTile = <NoSecretsManagerTile />;
    }
    let vpnProps = {
      invalidClientIpPoolTextCallback: function (stateData) {
        return invalidCidrBlock(stateData.client_ip_pool)
          ? "Invalid CIDR block"
          : "";
      },
      invalidClientIpPoolCallback: function (stateData) {
        return invalidCidrBlock(stateData.client_ip_pool);
      },
      invalidCrns: function (stateData, componentProps, field) {
        return invalidCrnList([stateData[field]]);
      },
      invalidCrnText: function (stateData, componentProps, field) {
        return invalidCrnList([stateData[field]])
          ? "Enter a valid resource CRN"
          : "";
      },
      propsMatchState: propsMatchState,
      vpnServerRouteProps: {
        onSave: craig.vpn_servers.routes.save,
        onSubmit: craig.vpn_servers.routes.create,
        onDelete: craig.vpn_servers.routes.delete,
        disableSave: function (field, stateData, componentProps) {
          // pass through function to change field name
          return disableSave("vpn_server_routes", stateData, componentProps);
        },
        invalidTextCallback: invalidNameText("vpn_server_routes"),
        invalidCallback: invalidName("vpn_server_routes"),
        propsMatchState: propsMatchState,
        craig: craig,
      },
    };
    transpose(vpnProps, formTemplate.innerFormProps);
  } else if (form === "accessGroups") {
    /* access groups */
    transpose(
      {
        propsMatchState: propsMatchState,
        /* policies */
        invalidPolicyCallback: invalidName("policies"),
        invalidPolicyTextCallback: invalidNameText("policies"),
        policyHelperTextCallback: accessGroupPolicyHelperTextCallback,
        policyProps: {
          onSave: craig.access_groups.policies.save,
          onDelete: craig.access_groups.policies.delete,
          onSubmit: craig.access_groups.policies.create,
          disableSave: disableSave,
          craig: craig,
          resourceGroups: splat(craig.store.json.resource_groups, "name"),
        },
        /* dynamic policies */
        invalidDynamicPolicyCallback: invalidName("dynamic_policies"),
        invalidDynamicPolicyTextCallback: invalidNameText("dynamic_policies"),
        dynamicPolicyHelperTextCallback: accessGroupPolicyHelperTextCallback,
        invalidIdentityProviderCallback: invalidIdentityProviderURI,
        dynamicPolicyProps: {
          onSave: craig.access_groups.dynamic_policies.save,
          onDelete: craig.access_groups.dynamic_policies.delete,
          onSubmit: craig.access_groups.dynamic_policies.create,
          disableSave: disableSave,
          craig: craig,
        },
      },
      formTemplate.innerFormProps
    );
  } else if (form === "sshKeys") {
    formTemplate.innerFormProps.invalidKeyCallback = invalidSshPublicKey;
    formTemplate.deleteDisabled = disableSshKeyDelete;
  } else if (form === "lb") {
    formTemplate.innerFormProps.vsiDeployments = craig.store.json.vsi;
  }

  return formTemplate;
}

export default formProps;
