import {
  clusterHelperTestCallback,
  disableSave,
  forceShowForm,
  invalidCrnText,
  invalidCrns,
  invalidName,
  invalidNameText,
  propsMatchState,
  resourceGroupHelperTextCallback,
} from "../../lib";
import {
  AccessGroupsTemplate,
  AppIdTemplate,
  ClustersTemplate,
  DnsTemplate,
  EventStreamsTemplate,
  ResourceGroupsTemplate,
  SecretsManagerTemplate,
  SecurityGroupTemplate,
  KeyManagementTemplate,
  NetworkAclTemplate,
  ObjectStorageTemplate,
  RoutingTableTemplate,
  SshKeysTemplate,
  TransitGatewayTemplate,
  VpnGatewayTemplate,
  VpnServerTemplate,
  VpcTemplate,
  VpeTemplate,
  VsiTemplate,
  VsiLoadBalancerTemplate,
} from "icse-react-assets";
import { RenderDocs } from "./SimplePages";
import { nestedSplat, splat } from "lazy-z";
import {
  cosResourceHelperTextCallback,
  disableSshKeyDelete,
  encryptionKeyFilter,
  invalidCidrBlock,
  invalidDnsZoneName,
  invalidEncryptionKeyRing,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
} from "../../lib/forms";
import {
  invalidCrnList,
  invalidDNSDescription,
  invalidIdentityProviderURI,
  invalidSshPublicKey,
  nullOrEmptyStringCheckCallback,
} from "../../lib/forms/invalid-callbacks";
import {
  accessGroupPolicyHelperTextCallback,
  aclHelperTextCallback,
  invalidDNSDescriptionText,
} from "../../lib/forms/text-callbacks";
import { CopyRuleForm } from "../forms";

const AccessGroupsPage = (craig) => {
  return (
    <AccessGroupsTemplate
      docs={RenderDocs("access_groups")}
      access_groups={craig.store.json.access_groups}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onDelete={craig.access_groups.delete}
      onSave={craig.access_groups.save}
      onSubmit={craig.access_groups.create}
      invalidCallback={invalidName("access_groups")}
      invalidTextCallback={invalidNameText("access_groups")}
      invalidPolicyCallback={invalidName("policies")}
      invalidPolicyTextCallback={invalidNameText("policies")}
      policyHelperTextCallback={accessGroupPolicyHelperTextCallback}
      onPolicyDelete={craig.access_groups.policies.delete}
      onPolicySave={craig.access_groups.policies.save}
      onPolicySubmit={craig.access_groups.policies.create}
      craig={craig}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidDynamicPolicyCallback={invalidName("dynamic_policies")}
      invalidDynamicPolicyTextCallback={invalidNameText("dynamic_policies")}
      dynamicPolicyHelperTextCallback={accessGroupPolicyHelperTextCallback}
      invalidIdentityProviderCallback={invalidIdentityProviderURI}
      onDynamicPolicyDelete={craig.access_groups.dynamic_policies.delete}
      onDynamicPolicySave={craig.access_groups.dynamic_policies.save}
      onDynamicPolicySubmit={craig.access_groups.dynamic_policies.create}
    />
  );
};

const AppIdPage = (craig) => {
  return (
    <AppIdTemplate
      docs={RenderDocs("appid")}
      appid={craig.store.json.appid}
      disableSave={disableSave}
      onDelete={craig.appid.delete}
      onSave={craig.appid.save}
      onSubmit={craig.appid.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("appid")}
      invalidTextCallback={invalidNameText("appid")}
      invalidKeyCallback={invalidName("appid_key")}
      invalidKeyTextCallback={invalidNameText("appid_key")}
      onKeySave={craig.appid.keys.save}
      onKeyDelete={craig.appid.keys.delete}
      onKeySubmit={craig.appid.keys.create}
      encryptionKeys={craig.store.encryptionKeys}
    />
  );
};

const ClusterPage = (craig) => {
  return (
    <ClustersTemplate
      docs={RenderDocs("clusters")}
      clusters={craig.store.json.clusters}
      disableSave={disableSave}
      onDelete={craig.clusters.delete}
      onSave={craig.clusters.save}
      onSubmit={craig.clusters.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("clusters")}
      invalidTextCallback={invalidNameText("clusters")}
      invalidPoolCallback={invalidName("worker_pools")}
      invalidPoolTextCallback={invalidNameText("worker_pools")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      vpcList={craig.store.vpcList}
      encryptionKeys={craig.store.encryptionKeys}
      subnetList={craig.getAllSubnets()}
      kubeVersionApiEndpoint="/api/cluster/versions"
      flavorApiEndpoint={`/api/cluster/${craig.store.json._options.region}/flavors`}
      helperTextCallback={clusterHelperTestCallback}
      cosNames={splat(craig.store.json.object_storage, "name")}
      onPoolSave={craig.clusters.worker_pools.save}
      onPoolDelete={craig.clusters.worker_pools.delete}
      onPoolSubmit={craig.clusters.worker_pools.create}
      disablePoolSave={function (field, stateData, componentProps) {
        // field is clusters, inject worker pools
        return disableSave("worker_pools", stateData, componentProps);
      }}
    />
  );
};

const DnsPage = (craig) => {
  return (
    <DnsTemplate
      craig={craig}
      docs={RenderDocs("dns")}
      dns={craig.store.json.dns}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onDelete={craig.dns.save}
      onSave={craig.dns.delete}
      onSubmit={craig.dns.create}
      forceOpen={forceShowForm}
      invalidTextCallback={invalidNameText("dns")}
      invalidCallback={invalidName("dns")}
      onZoneSave={craig.dns.zones.save}
      onZoneDelete={craig.dns.zones.delete}
      onZoneSubmit={craig.dns.zones.create}
      invalidZoneNameCallback={invalidDnsZoneName}
      invalidZoneNameTextCallback={invalidNameText("zones")}
      invalidLabelCallback={nullOrEmptyStringCheckCallback("label")}
      invalidDescriptionCallback={invalidDNSDescription}
      invalidDescriptionTextCallback={invalidDNSDescriptionText}
      vpcList={craig.store.vpcList}
      onRecordSave={craig.dns.records.save}
      onRecordDelete={craig.dns.records.delete}
      onRecordSubmit={craig.dns.records.create}
      invalidRecordCallback={invalidName("records")}
      invalidRecordTextCallback={invalidNameText("records")}
      invalidRdataCallback={nullOrEmptyStringCheckCallback("records")}
      dnsZones={nestedSplat(craig.store.json.dns, "zones", "name")}
      onResolverSave={craig.dns.custom_resolvers.save}
      onResolverSubmit={craig.dns.custom_resolvers.create}
      onResolverDelete={craig.dns.custom_resolvers.delete}
      invalidResolverNameCallback={invalidName("custom_resolvers")}
      invalidResolverNameTextCallback={invalidNameText("custom_resolvers")}
      invalidResolverDescriptionCallback={invalidDNSDescription}
      invalidResolverDescriptionTextCallback={invalidDNSDescriptionText}
      subnetList={craig.getAllSubnets()}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
    />
  );
};

const EventStreamsPage = (craig) => {
  return (
    <EventStreamsTemplate
      event_streams={craig.store.json.event_streams}
      disableSave={disableSave}
      onDelete={craig.event_streams.delete}
      onSave={craig.event_streams.save}
      onSubmit={craig.event_streams.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("event_streams")}
      invalidTextCallback={invalidNameText("event_streams")}
      craig={craig}
      docs={RenderDocs("event_streams")}
    />
  );
};

const KeyManagementPage = (craig) => {
  return (
    <KeyManagementTemplate
      docs={RenderDocs("key_management")}
      key_management={craig.store.json.key_management}
      disableSave={disableSave}
      onDelete={craig.key_management.delete}
      onSave={craig.key_management.save}
      onSubmit={craig.key_management.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      deleteDisabled={() => {
        return craig.store.json.key_management.length === 1;
      }}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("key_management")}
      invalidTextCallback={invalidNameText("key_management")}
      invalidKeyCallback={invalidName("encryption_keys")}
      invalidKeyTextCallback={invalidNameText("encryption_keys")}
      invalidRingCallback={invalidEncryptionKeyRing}
      invalidRingText={
        "Invalid Key Ring Name. Must match the regular expression: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s"
      }
      onKeySave={craig.key_management.keys.save}
      onKeyDelete={craig.key_management.keys.delete}
      onKeySubmit={craig.key_management.keys.create}
    />
  );
};

const NetworkAclPage = (craig) => {
  return (
    <NetworkAclTemplate
      vpcs={craig.store.json.vpcs}
      docs={RenderDocs("acls")}
      forceOpen={forceShowForm}
      craig={craig}
      onAclSubmit={craig.vpcs.acls.create}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      child={CopyRuleForm}
      invalidTextCallback={invalidNameText("acls")}
      invalidCallback={invalidName("acls")}
      invalidRuleTextCallback={invalidNameText("acl_rules")}
      invalidRuleText={invalidName("acl_rules")}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      helperTextCallback={aclHelperTextCallback}
      onRuleSave={craig.vpcs.acls.rules.save}
      onRuleDelete={craig.vpcs.acls.rules.delete}
      onSubmitCallback={craig.vpcs.acls.rules.create}
      onSave={craig.vpcs.acls.save}
      onDelete={craig.vpcs.acls.delete}
    />
  );
};

const LoadBalancerPage = (craig) => {
  return (
    <VsiLoadBalancerTemplate
      docs={RenderDocs("load_balancers")}
      load_balancers={craig.store.json.load_balancers}
      disableSave={disableSave}
      onDelete={craig.load_balancers.delete}
      onSave={craig.load_balancers.save}
      onSubmit={craig.load_balancers.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("load_balancers")}
      invalidTextCallback={invalidNameText("load_balancers")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      vsiDeployments={craig.store.json.vsi}
    />
  );
};

const ObjectStoragePage = (craig) => {
  return (
    <ObjectStorageTemplate
      docs={RenderDocs("object_storage")}
      object_storage={craig.store.json.object_storage}
      disableSave={disableSave}
      onDelete={craig.object_storage.delete}
      onSave={craig.object_storage.save}
      onSubmit={craig.object_storage.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      kmsList={splat(craig.store.json.key_management, "name")}
      invalidCallback={invalidName("object_storage")}
      invalidTextCallback={invalidNameText("object_storage")}
      invalidKeyCallback={invalidName("cos_keys")}
      invalidKeyTextCallback={invalidNameText("cos_keys")}
      invalidBucketCallback={invalidName("buckets")}
      invalidBucketTextCallback={invalidNameText("buckets")}
      onKeySave={craig.object_storage.keys.save}
      onKeyDelete={craig.object_storage.keys.delete}
      onKeySubmit={craig.object_storage.keys.create}
      onBucketSave={craig.object_storage.buckets.save}
      onBucketDelete={craig.object_storage.buckets.delete}
      onBucketSubmit={craig.object_storage.buckets.create}
      composedNameCallback={cosResourceHelperTextCallback}
      encryptionKeyFilter={encryptionKeyFilter}
    />
  );
};

const ResourceGroupPage = (craig) => {
  return (
    <ResourceGroupsTemplate
      resource_groups={craig.store.json.resource_groups}
      docs={RenderDocs("resource_groups")}
      disableSave={disableSave}
      onDelete={craig.resource_groups.delete}
      onSave={craig.resource_groups.save}
      onSubmit={craig.resource_groups.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      deleteDisabled={() => {
        return craig.store.json.resource_groups.length === 1;
      }}
      helperTextCallback={resourceGroupHelperTextCallback}
      invalidCallback={invalidName("resource_groups")}
      invalidTextCallback={invalidNameText("resource_groups")}
    />
  );
};

const RoutingTablesPage = (craig) => {
  return (
    <RoutingTableTemplate
      routing_tables={craig.store.json.routing_tables}
      disableSave={disableSave}
      docs={RenderDocs("routing_tables")}
      propsMatchState={propsMatchState}
      onDelete={craig.routing_tables.delete}
      onSave={craig.routing_tables.save}
      onSubmit={craig.routing_tables.create}
      forceOpen={forceShowForm}
      craig={craig}
      vpcList={craig.store.vpcList}
      invalidCallback={invalidName("routing_tables")}
      invalidTextCallback={invalidNameText("routing_tables")}
      invalidRouteTextCallback={invalidNameText("routes")}
      invalidRouteCallback={invalidName("routes")}
      onRouteSave={craig.routing_tables.routes.delete}
      onRouteDelete={craig.routing_tables.routes.save}
      onRouteSubmit={craig.routing_tables.routes.create}
    />
  );
};

const SecretsManagerPage = (craig) => {
  return (
    <SecretsManagerTemplate
      secrets_managers={craig.store.json.secrets_manager}
      disableSave={disableSave}
      onDelete={craig.secrets_manager.delete}
      onSave={craig.secrets_manager.save}
      onSubmit={craig.secrets_manager.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      invalidCallback={invalidName("secrets_manager")}
      invalidTextCallback={invalidNameText("secrets_manager")}
      secrets={craig.getAllResourceKeys()}
      docs={RenderDocs("secrets_manager")}
    />
  );
};

const SecurityGroupPage = (craig) => {
  return (
    <>
      <SecurityGroupTemplate
        docs={RenderDocs("security_groups")}
        security_groups={craig.store.json.security_groups}
        disableSave={disableSave}
        onDelete={craig.security_groups.delete}
        onSave={craig.security_groups.save}
        onSubmit={craig.security_groups.create}
        propsMatchState={propsMatchState}
        forceOpen={forceShowForm}
        craig={craig}
        resourceGroups={splat(craig.store.json.resource_groups, "name")}
        invalidCallback={invalidName("security_groups")}
        invalidTextCallback={invalidNameText("security_groups")}
        disableSaveCallback={function (stateData, componentProps) {
          return (
            propsMatchState("sg_rules", stateData, componentProps) ||
            disableSave("sg_rules", stateData, componentProps)
          );
        }}
        invalidRuleText={invalidSecurityGroupRuleName}
        invalidRuleTextCallback={invalidSecurityGroupRuleText}
        onSubmitCallback={craig.security_groups.rules.create}
        onRuleSave={craig.security_groups.rules.save}
        onRuleDelete={craig.security_groups.rules.delete}
        vpcList={craig.store.vpcList}
      />
      {craig.store.json.security_groups.length > 0 && (
        <CopyRuleForm craig={craig} isAclForm={false} />
      )}
    </>
  );
};

const SshKeysPage = (craig) => {
  return (
    <SshKeysTemplate
      ssh_keys={craig.store.json.ssh_keys}
      disableSave={disableSave}
      onDelete={craig.ssh_keys.delete}
      onSave={craig.ssh_keys.save}
      onSubmit={craig.ssh_keys.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("ssh_keys")}
      invalidTextCallback={invalidNameText("ssh_keys")}
      craig={craig}
      docs={RenderDocs("ssh_keys")}
      deleteDisabled={disableSshKeyDelete}
      invalidKeyCallback={invalidSshPublicKey}
    />
  );
};

const TransitGatewayPage = (craig) => {
  return (
    <TransitGatewayTemplate
      docs={RenderDocs("transit_gateways")}
      transit_gateways={craig.store.json.transit_gateways}
      disableSave={disableSave}
      onDelete={craig.transit_gateways.delete}
      onSave={craig.transit_gateways.save}
      onSubmit={craig.transit_gateways.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("transit_gateways")}
      invalidTextCallback={invalidNameText("transit_gateways")}
      vpcList={craig.store.vpcList}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCrns={invalidCrns}
      invalidCrnText={invalidCrnText}
    />
  );
};

const VpnGatewayPage = (craig) => {
  return (
    <VpnGatewayTemplate
      docs={RenderDocs("vpn_gateways")}
      vpn_gateways={craig.store.json.vpn_gateways}
      disableSave={disableSave}
      onDelete={craig.vpn_gateways.delete}
      onSave={craig.vpn_gateways.save}
      onSubmit={craig.vpn_gateways.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("vpn_gateways")}
      invalidTextCallback={invalidNameText("vpn_gateways")}
      vpcList={craig.store.vpcList}
      subnetList={craig.getAllSubnets()}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
    />
  );
};

const VpnServerPage = (craig) => {
  return (
    <VpnServerTemplate
      noSecretsManager={craig.store.json.secrets_manager.length === 0}
      vpn_servers={craig.store.json.vpn_servers}
      disableSave={disableSave}
      onDelete={craig.vpn_servers.delete}
      onSave={craig.vpn_servers.save}
      onSubmit={craig.vpn_servers.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("vpn_servers")}
      invalidTextCallback={invalidNameText("vpn_servers")}
      craig={craig}
      docs={RenderDocs("vpn_servers")}
      invalidCidrBlock={invalidCidrBlock}
      invalidCrnList={invalidCrnList}
      onRouteSave={craig.vpn_servers.routes.save}
      onRouteDelete={craig.vpn_servers.routes.delete}
      onRouteSubmit={craig.vpn_servers.routes.create}
      invalidRouteCallback={invalidName("vpn_server_routes")}
      invalidRouteTextCallback={invalidNameText("vpn_server_routes")}
      subnetList={craig.getAllSubnets()}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
    />
  );
};

const VpcPage = (craig) => {
  return (
    <VpcTemplate
      docs={RenderDocs("vpcs")}
      vpcs={craig.store.json.vpcs}
      disableSave={disableSave}
      onDelete={craig.vpcs.delete}
      onSave={craig.vpcs.save}
      onSubmit={craig.vpcs.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("vpcs")}
      invalidTextCallback={invalidNameText("vpcs")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      cosBuckets={craig.store.cosBuckets}
    />
  );
};

const VpePage = (craig) => {
  return (
    <VpeTemplate
      docs={RenderDocs("vpe")}
      vpe={craig.store.json.vpe}
      disableSave={disableSave}
      onDelete={craig.vpe.delete}
      onSave={craig.vpe.save}
      onSubmit={craig.vpe.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("vpe")}
      invalidTextCallback={invalidNameText("vpe")}
      vpcList={craig.store.vpcList}
      subnetList={craig.getAllSubnets()}
      securityGroups={craig.store.json.security_groups}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      secretsManagerInstances={splat(craig.store.json.secrets_manager, "name")}
    />
  );
};

const VsiPage = (craig) => {
  return (
    <VsiTemplate
      docs={RenderDocs("vsi")}
      vsi={craig.store.json.vsi}
      disableSave={disableSave}
      onDelete={craig.vsi.delete}
      onSave={craig.vsi.save}
      onSubmit={craig.vsi.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      sshKeys={craig.store.sshKeys}
      apiEndpointImages={`/api/vsi/${craig.store.json._options.region}/images`}
      apiEndpointInstanceProfiles={`/api/vsi/${craig.store.json._options.region}/instanceProfiles`}
      invalidCallback={invalidName("vsi")}
      invalidTextCallback={invalidNameText("vsi")}
      invalidVolumeCallback={invalidName("volume")}
      invalidVolumeTextCallback={invalidNameText("volume")}
      onVolumeSave={craig.vsi.volumes.save}
      onVolumeDelete={craig.vsi.volumes.delete}
      onVolumeCreate={craig.vsi.volumes.create}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      subnetList={craig.getAllSubnets()}
    />
  );
};

export const NewFormPage = (props) => {
  let { form, craig } = props;

  if (form === "accessGroups") {
    return AccessGroupsPage(craig);
  } else if (form === "appID") {
    return AppIdPage(craig);
  } else if (form === "clusters") {
    return ClusterPage(craig);
  } else if (form === "dns") {
    return DnsPage(craig);
  } else if (form === "eventStreams") {
    return EventStreamsPage(craig);
  } else if (form === "keyManagement") {
    return KeyManagementPage(craig);
  } else if (form === "lb") {
    return LoadBalancerPage(craig);
  } else if (form === "nacls") {
    return NetworkAclPage(craig);
  } else if (form === "objectStorage") {
    return ObjectStoragePage(craig);
  } else if (form === "resourceGroups") {
    return ResourceGroupPage(craig);
  } else if (form === "secretsManager") {
    return SecretsManagerPage(craig);
  } else if (form === "routingTables") {
    return RoutingTablesPage(craig);
  } else if (form === "securityGroups") {
    return SecurityGroupPage(craig);
  } else if (form === "sshKeys") {
    return SshKeysPage(craig);
  } else if (form === "transitGateways") {
    return TransitGatewayPage(craig);
  } else if (form === "vpcs") {
    return VpcPage(craig);
  } else if (form === "vpe") {
    return VpePage(craig);
  } else if (form === "vpn") {
    return VpnGatewayPage(craig);
  } else if (form === "vpnServers") {
    return VpnServerPage(craig);
  } else if (form === "vsi") {
    return VsiPage(craig);
  }
};
