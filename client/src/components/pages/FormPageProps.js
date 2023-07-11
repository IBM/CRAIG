import {
  AccessGroupForm,
  AppIdForm,
  ClusterForm,
  EventStreamsForm,
  KeyManagementForm,
  ObjectStorageForm,
  ResourceGroupForm,
  SecretsManagerForm,
  SecurityGroupForm,
  SshKeyForm,
  TransitGatewayForm,
  VpcForm,
  VpeForm,
  VpnGatewayForm,
  VsiForm,
  RoutingTableForm,
  VsiLoadBalancerForm,
  VpnServerForm,
  DnsForm,
} from "icse-react-assets";
import { getObjectFromArray, splat, transpose, nestedSplat } from "lazy-z";
import {
  clusterHelperTestCallback,
  cosResourceHelperTextCallback,
  disableSave,
  forceShowForm,
  invalidEncryptionKeyRing,
  invalidName,
  invalidNameText,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
  invalidSshPublicKey,
  accessGroupPolicyHelperTextCallback,
  propsMatchState,
  resourceGroupHelperTextCallback,
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
import {
  invalidDNSDescription,
  invalidDnsZoneName,
  nullOrEmptyStringCheckCallback,
} from "../../lib/forms/invalid-callbacks";
import { invalidDNSDescriptionText } from "../../lib/forms/text-callbacks";

const pathToFormMap = {
  accessGroups: {
    jsonField: "access_groups",
    name: "Access Groups",
    addText: "Create an Access Group",
    innerForm: AccessGroupForm,
  },
  secretsManager: {
    jsonField: "secrets_manager",
    name: "Secrets Manager",
    addText: "Create a Secrets Manager Instance",
    innerForm: SecretsManagerForm,
  },
  keyManagement: {
    jsonField: "key_management",
    name: "Key Management",
    addText: "Create a Key Management Service",
    innerForm: KeyManagementForm,
  },
  objectStorage: {
    jsonField: "object_storage",
    name: "Object Storage",
    addText: "Create an Object Storage Service",
    innerForm: ObjectStorageForm,
  },
  appID: {
    jsonField: "appid",
    name: "AppID",
    addText: "Create an AppID Service",
    innerForm: AppIdForm,
  },
  vpcs: {
    jsonField: "vpcs",
    name: "Virtual Private Clouds",
    addText: "Create a VPC",
    innerForm: VpcForm,
  },
  vsi: {
    jsonField: "vsi",
    name: "Virtual Server Instances",
    addText: "Create a VSI",
    innerForm: VsiForm,
  },
  sshKeys: {
    jsonField: "ssh_keys",
    name: "SSH Keys",
    addText: "Create an SSH Key",
    innerForm: SshKeyForm,
  },
  transitGateways: {
    jsonField: "transit_gateways",
    name: "Transit Gateways",
    addText: "Create a Transit Gateway",
    innerForm: TransitGatewayForm,
  },
  vpn: {
    jsonField: "vpn_gateways",
    name: "VPN Gateways",
    addText: "Create a VPN Gateway",
    innerForm: VpnGatewayForm,
  },
  securityGroups: {
    jsonField: "security_groups",
    name: "Security Groups",
    addText: "Create a Security Group",
    innerForm: SecurityGroupForm,
  },
  eventStreams: {
    jsonField: "event_streams",
    name: "Event Streams",
    addText: "Create an Event Streams Service",
    innerForm: EventStreamsForm,
  },
  vpe: {
    jsonField: "virtual_private_endpoints",
    name: "Virtual Private Endpoints",
    addText: "Create a VPE",
    innerForm: VpeForm,
  },
  routingTables: {
    jsonField: "routing_tables",
    name: "Routing Tables",
    addText: "Create a Routing Table",
    innerForm: RoutingTableForm,
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
  dns: {
    jsonField: "dns",
    name: "DNS Service",
    addText: "Create a DNS Service",
    innerForm: DnsForm,
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

  if (form === "dns") {
    let dnsProps = {
      propsMatchState: propsMatchState,
      invalidNameCallback: invalidName("dns"),
      invalidNameTextCallback: invalidNameText("dns"),
      zoneProps: {
        craig: craig,
        onSave: craig.dns.zones.save,
        onDelete: craig.dns.zones.delete,
        onSubmit: craig.dns.zones.create,
        disableSave: disableSave,
        invalidNameCallback: invalidDnsZoneName,
        invalidNameTextCallback: invalidNameText("zones"),
        invalidLabelCallback: nullOrEmptyStringCheckCallback("label"),
        invalidLabelTextCallback: () => {
          return "Label cannot be null or empty string.";
        },
        invalidDescriptionCallback: invalidDNSDescription,
        invalidDescriptionTextCallback: invalidDNSDescriptionText,
        vpcList: craig.store.vpcList,
      },
      recordProps: {
        craig: craig,
        onSave: craig.dns.records.save,
        onDelete: craig.dns.records.delete,
        onSubmit: craig.dns.records.create,
        disableSave: disableSave,
        invalidCallback: invalidName("records"),
        invalidTextCallback: invalidNameText("records"),
        invalidRdata: nullOrEmptyStringCheckCallback("rdata"),
        invalidRdataText: () => {
          return "Resource Data cannot be null or empty string.";
        },
        dnsZones: nestedSplat(craig.store.json.dns, "zones", "name"),
      },
      resolverProps: {
        craig: craig,
        onSave: craig.dns.custom_resolvers.save,
        onDelete: craig.dns.custom_resolvers.delete,
        onSubmit: craig.dns.custom_resolvers.create,
        disableSave: disableSave,
        invalidNameCallback: invalidName("custom_resolvers"),
        invalidNameTextCallback: invalidNameText("custom_resolvers"),
        invalidCallback: none, // these are only used on a select which handles its own invalid state
        invalidTextCallback: none,
        invalidDescriptionCallback: invalidDNSDescription,
        invalidDescriptionTextCallback: invalidDNSDescriptionText,
        subnetList: craig.getAllSubnets(),
        vpcList: craig.store.vpcList,
      },
    };
    transpose(dnsProps, formTemplate.innerFormProps);
  }

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
  } else if (form === "resourceGroups") {
    formTemplate.deleteDisabled = () => {
      return craig.store.json.resource_groups.length === 1;
    };
    formTemplate.innerFormProps.helperTextCallback =
      resourceGroupHelperTextCallback;
  } else if (form === "keyManagement") {
    /**
     * key management
     */
    formTemplate.deleteDisabled = () => {
      return craig.store.json.key_management.length === 1;
    };
    transpose(
      {
        invalidKeyCallback: invalidName("encryption_keys"),
        invalidKeyTextCallback: invalidNameText("encryption_keys"),
        invalidRingCallback: invalidEncryptionKeyRing,
        invalidRingText:
          "Invalid Key Ring Name. Must match the regular expression: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        propsMatchState: propsMatchState,
        encryptionKeyProps: {
          onSave: craig.key_management.keys.save,
          onDelete: craig.key_management.keys.delete,
          onSubmit: craig.key_management.keys.create,
          disableSave: disableSave,
          craig: craig,
        },
      },
      formTemplate.innerFormProps
    );
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
  } else if (form === "objectStorage") {
    /**
     * cos
     */
    transpose(
      {
        composedNameCallback: cosResourceHelperTextCallback,
        kmsList: splat(craig.store.json.key_management, "name"),
        invalidKeyCallback: invalidName("cos_keys"),
        invalidKeyTextCallback: invalidNameText("cos_keys"),
        propsMatchState: propsMatchState,
        invalidBucketCallback: invalidName("buckets"),
        invalidBucketTextCallback: invalidNameText("buckets"),
        keyProps: {
          onSave: craig.object_storage.keys.save,
          onDelete: craig.object_storage.keys.delete,
          onSubmit: craig.object_storage.keys.create,
          disableSave: disableSave,
          craig: craig,
        },
        bucketProps: {
          onSave: craig.object_storage.buckets.save,
          onDelete: craig.object_storage.buckets.delete,
          onSubmit: craig.object_storage.buckets.create,
          disableSave: disableSave,
          craig: craig,
          encryptionKeys: craig.store.encryptionKeys,
          encryptionKeyFilter: function (_, componentProps) {
            let cosName = componentProps.isModal
              ? componentProps.parent_name
              : componentProps.arrayParentName;
            let { kms } = getObjectFromArray(
              craig.store.json.object_storage,
              "name",
              cosName
            );
            let { keys } = kms
              ? getObjectFromArray(craig.store.json.key_management, "name", kms)
              : [];
            return kms ? splat(keys, "name") : [];
          },
        },
      },
      formTemplate.innerFormProps
    );
  } else if (form === "appID") {
    /**
     * appid
     */
    transpose(
      {
        invalidKeyCallback: invalidName("appid_keys"),
        invalidKeyTextCallback: invalidNameText("appid_keys"),
        propsMatchState: propsMatchState,
        keyProps: {
          disableSave: disableSave,
          onSave: craig.appid.keys.save,
          onDelete: craig.appid.keys.delete,
          onSubmit: craig.appid.keys.create,
          craig: craig,
        },
      },
      formTemplate.innerFormProps
    );
  } else if (form === "vpcs") {
    formTemplate.innerFormProps.cosBuckets = craig.store.cosBuckets;
  } else if (form === "sshKeys") {
    formTemplate.innerFormProps.invalidKeyCallback = invalidSshPublicKey;
    formTemplate.deleteDisabled = disableSshKeyDelete;
  } else if (form === "transitGateways") {
    formTemplate.innerFormProps.readOnlyName = false;
    formTemplate.innerFormProps.invalidCrns = function (stateData) {
      return invalidCrnList(stateData.crns);
    };
    formTemplate.innerFormProps.invalidCrnText = function (stateData) {
      return invalidCrnList(stateData.crns)
        ? "Enter a valid comma separated list of CRNs"
        : "";
    };
  } else if (form === "securityGroups") {
    let sgInnerFormProps = {
      onSubmitCallback: craig.security_groups.rules.create,
      onRuleSave: craig.security_groups.rules.save,
      onRuleDelete: craig.security_groups.rules.delete,
      disableModalSubmitCallback: none,
      disableSaveCallback: function (stateData, componentProps) {
        return (
          propsMatchState("sg_rules", stateData, componentProps) ||
          disableSave("sg_rules", stateData, componentProps)
        );
      },
      invalidCallback: invalidName("security_groups"),
      invalidRuleText: invalidSecurityGroupRuleName,
      invalidTextCallback: invalidNameText("security_groups"),
      invalidRuleTextCallback: invalidSecurityGroupRuleText,
    };
    formTemplate.isSecurityGroup = true;
    transpose(sgInnerFormProps, formTemplate.innerFormProps);
  } else if (form === "vsi") {
    transpose(
      {
        sshKeys: craig.store.sshKeys,
        apiEndpointImages: `/api/vsi/${craig.store.json._options.region}/images`,
        apiEndpointInstanceProfiles: `/api/vsi/${craig.store.json._options.region}/instanceProfiles`,
        invalidVsiVolumeCallback: invalidName("volume"),
        invalidVsiVolumeTextCallback: invalidNameText("volume"),
        propsMatchState: propsMatchState,
        vsiVolumeProps: {
          onSave: craig.vsi.volumes.save,
          onDelete: craig.vsi.volumes.delete,
          onSubmit: craig.vsi.volumes.create,
          disableSave: disableSave,
          encryptionKeys: craig.store.encryptionKeys,
          craig: craig,
        },
      },
      formTemplate.innerFormProps
    );
  } else if (form === "eventStreams") {
    let esInnerFormProps = {
      invalidCallback: invalidName("event_streams"),
      invalidTextCallback: invalidNameText("event_streams"),
    };
    transpose(esInnerFormProps, formTemplate.innerFormProps);
  }
  if (form === "routingTables") {
    let routeFormProps = {
      invalidRouteCallback: invalidName("routes"),
      invalidRouteTextCallback: invalidNameText("routes"),
      propsMatchState: propsMatchState,
      routeProps: {
        disableSave: disableSave,
        onDelete: craig.routing_tables.routes.delete,
        onSave: craig.routing_tables.routes.save,
        onSubmit: craig.routing_tables.routes.create,
        craig: craig,
      },
    };
    transpose(routeFormProps, formTemplate.innerFormProps);
  } else if (form === "lb") {
    formTemplate.innerFormProps.vsiDeployments = craig.store.json.vsi;
  } else if (form === "secretsManager") {
    formTemplate.innerFormProps.secrets = craig.getAllResourceKeys();
  }

  return formTemplate;
}

export default formProps;
