import {
  buildSubnet,
  disableSave,
  forceShowForm,
  invalidName,
  invalidNameText,
  propsMatchState,
} from "../../lib";
import {
  SecretsManagerTemplate,
  SecurityGroupTemplate,
  SubnetPageTemplate,
  NetworkAclTemplate,
  VpnServerTemplate,
  VsiLoadBalancerTemplate,
  SccV1Page,
  IcseFormTemplate,
} from "icse-react-assets";
import { RenderDocs } from "./SimplePages";
import { contains, eachKey, keys, splat, transpose } from "lazy-z";
import {
  disableSshKeyDelete,
  getSubnetTierStateData,
  getTierSubnets,
  invalidCidrBlock,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
  vpnServersHelperText,
} from "../../lib/forms";
import { invalidCidr, invalidCrnList } from "../../lib/forms/invalid-callbacks";
import {
  aclHelperTextCallback,
  genericNameCallback,
  invalidCidrText,
} from "../../lib/forms/text-callbacks";
import { CopyRuleForm } from "../forms";
import { Tile } from "@carbon/react";
import { CloudAlerting } from "@carbon/icons-react";
import { edgeRouterEnabledZones } from "../../lib/constants";
import powerStoragePoolRegionMap from "../../lib/docs/power-storage-pool-map.json";
import DynamicForm from "../forms/DynamicForm";
import { ClassicDisabledTile, NoCisTile } from "../forms/dynamic-form/tiles";
import PropTypes from "prop-types";
import { CraigToggleForm } from "../forms/utils";
import StatefulTabs from "../forms/utils/StatefulTabs";

const formPageTemplate = (craig, options, form) => {
  let innerFormProps = {
    craig: craig,
    form: form,
    disableSave: disableSave,
    formName: options.formName,
  };
  if (options.innerFormProps) transpose(options.innerFormProps, innerFormProps);
  return (
    <IcseFormTemplate
      name={options.name}
      addText={options.addText}
      docs={RenderDocs(options.jsonField, craig.store.json._options.template)}
      arrayData={craig.store.json[options.jsonField]}
      onDelete={craig[options.jsonField].delete}
      onSave={craig[options.jsonField].save}
      onSubmit={craig[options.jsonField].create}
      disableSave={disableSave}
      innerForm={DynamicForm}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      hideFormTitleButton={options.hideFormTitleButton}
      overrideTile={options.overrideTile}
      innerFormProps={innerFormProps}
      deleteDisabledMessage={options.deleteDisabledMessage}
      deleteDisabled={options.deleteDisabled}
      toggleFormProps={{
        craig: craig,
        disableSave: disableSave,
        submissionFieldName: options.jsonField,
        hideName: true,
        // hide: false,
      }}
    />
  );
};

formPageTemplate.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({
    jsonField: PropTypes.string.isRequired,
    hideFormTitleButton: PropTypes.bool,
    overrideTile: PropTypes.node,
    formName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    addText: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({}).isRequired,
};

const AccessGroupsPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Access Groups",
      addText: "Create an Access Group",
      formName: "access-groups",
      jsonField: "access_groups",
    },
    {
      jsonField: "access_groups",
      groups: [
        {
          name: craig.access_groups.name,
        },
        {
          description: craig.access_groups.description,
        },
      ],
      subForms: [
        {
          name: "Policies",
          addText: "Create a new Policy",
          jsonField: "policies",
          form: {
            groups: [
              {
                name: craig.access_groups.policies.name,
              },
              {
                heading: {
                  name: "Resource Configuration",
                  type: "subHeading",
                },
              },
              {
                resource: craig.access_groups.policies.resource,
                resource_group: craig.access_groups.policies.resource_group,
              },
              {
                resource_instance_id:
                  craig.access_groups.policies.resource_instance_id,
                service: craig.access_groups.policies.service,
              },
              {
                resource_type: craig.access_groups.policies.resource_type,
              },
            ],
          },
        },
        {
          name: "Dynamic Policies",
          addText: "Create a Dynamic Policy",
          jsonField: "dynamic_policies",
          form: {
            groups: [
              {
                name: craig.access_groups.dynamic_policies.name,
                expiration: craig.access_groups.dynamic_policies.expiration,
              },
              {
                identity_provider:
                  craig.access_groups.dynamic_policies.identity_provider,
              },
              {
                heading: {
                  name: "Condition Configuration",
                  type: "subHeading",
                },
              },
              {
                claim: craig.access_groups.dynamic_policies.claim,
              },
              {
                operator: craig.access_groups.dynamic_policies.operator,
                value: craig.access_groups.dynamic_policies.value,
              },
            ],
          },
        },
      ],
    }
  );
};

const AppIdPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "AppID",
      addText: "Create an AppID Instance",
      formName: "appid",
      jsonField: "appid",
    },
    {
      jsonField: "appid",
      groups: [
        {
          use_data: craig.appid.use_data,
        },
        {
          name: craig.appid.name,
          resource_group: craig.appid.resource_group,
          encryption_key: craig.appid.encryption_key,
        },
      ],
      subForms: [
        {
          name: "AppID Keys",
          addText: "Create an AppID Key",
          jsonField: "keys",
          form: {
            groups: [
              {
                name: craig.appid.keys.name,
              },
            ],
          },
        },
      ],
    }
  );
};

const Atracker = (craig) => {
  return (
    <CraigToggleForm
      craig={craig}
      about={RenderDocs("atracker", craig.store.json._options.template)()}
      name="iac-atracker"
      hideName
      noDeleteButton={true}
      onDelete={craig.atracker.delete}
      useAddButton={false}
      tabPanel={{
        name: "Activity Tracker",
      }}
      onShowToggle={() => {}}
      submissionFieldName="atracker"
      onSave={craig.atracker.save}
      innerFormProps={{
        craig: craig,
        data: craig.store.json.atracker,
        disableSave: disableSave,
        form: {
          jsonField: "atracker",
          disableSave: disableSave,
          groups: [
            {
              enabled: craig.atracker.enabled,
              instance: craig.atracker.instance,
            },
            {
              name: craig.atracker.name,
              locations: craig.atracker.locations,
              bucket: craig.atracker.bucket,
            },
            {
              add_route: craig.atracker.add_route,
              cos_key: craig.atracker.cos_key,
            },
            {
              resource_group: craig.atracker.resource_group,
              plan: craig.atracker.plan,
            },
          ],
        },
      }}
    />
  );
};

const Cis = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Cloud Internet Services (CIS)",
      addText: "Create a CIS Instance",
      formName: "CIS",
      jsonField: "cis",
    },
    {
      jsonField: "cis",
      setDefault: {
        domains: [],
        dns_records: [],
      },
      groups: [
        {
          name: craig.cis.name,
          resource_group: craig.cis.resource_group,
          plan: craig.cis.plan,
        },
      ],
      subForms: [
        {
          name: "Domains",
          addText: "Add a domain",
          jsonField: "domains",
          toggleFormFieldName: "domain",
          form: {
            groups: [
              {
                domain: craig.cis.domains.domain,
                type: craig.cis.domains.type,
              },
            ],
          },
        },
        {
          name: "DNS Records",
          addText: "Add a DNS Record",
          jsonField: "dns_records",
          hideFormTitleButton: function (stateData, componentProps) {
            return componentProps.data.domains.length === 0;
          },
          form: {
            groups: [
              {
                name: craig.cis.dns_records.name,
                domain: craig.cis.dns_records.domain,
              },
              {
                type: craig.cis.dns_records.type,
                content: craig.cis.dns_records.content,
              },
              {
                ttl: craig.cis.dns_records.ttl,
              },
            ],
          },
        },
      ],
    }
  );
};

const CisGlbs = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "CIS Global Load Balancers",
      addText: "Create an Origin Pool",
      formName: "cis-glbs",
      jsonField: "cis_glbs",
      overrideTile:
        craig.store.json.cis.length === 0 ? <NoCisTile /> : undefined,
    },
    {
      jsonField: "cis_glbs",
      groups: [
        {
          name: craig.cis_glbs.name,
          cis: craig.cis_glbs.cis,
        },
        {
          minimum_origins: craig.cis_glbs.minimum_origins,
          enabled: craig.cis_glbs.enabled,
        },
        {
          description: craig.cis_glbs.description,
        },
      ],
      subForms: [
        {
          name: "Origins",
          addText: "Add an Origin",
          jsonField: "origins",
          form: {
            groups: [
              {
                name: craig.cis_glbs.origins.name,
                address: craig.cis_glbs.origins.address,
              },
              {
                enabled: craig.cis_glbs.origins.enabled,
              },
            ],
          },
        },
        {
          name: "Global Load Balancers",
          addText: "Create a Global Load Balancer",
          jsonField: "glbs",
          form: {
            groups: [
              {
                name: craig.cis_glbs.glbs.name,
                domain: craig.cis_glbs.glbs.domain,
              },
              {
                default_pools: craig.cis_glbs.glbs.default_pools,
                fallback_pool: craig.cis_glbs.glbs.fallback_pool,
              },
              {
                ttl: craig.cis_glbs.glbs.ttl,
              },
              {
                enabled: craig.cis_glbs.glbs.enabled,
                proxied: craig.cis_glbs.glbs.proxied,
              },
            ],
          },
        },
        {
          name: "Health Checks",
          addText: "Create a Health Check",
          jsonField: "health_checks",
          form: {
            groups: [
              {
                name: craig.cis_glbs.health_checks.name,
                method: craig.cis_glbs.health_checks.method,
                type: craig.cis_glbs.health_checks.type,
              },
              {
                expected_codes: craig.cis_glbs.health_checks.expected_codes,
                timeout: craig.cis_glbs.health_checks.timeout,
                interval: craig.cis_glbs.health_checks.interval,
              },
              {
                path: craig.cis_glbs.health_checks.path,
                port: craig.cis_glbs.health_checks.port,
                retries: craig.cis_glbs.health_checks.retries,
              },
              {
                allow_insecure: craig.cis_glbs.health_checks.allow_insecure,
                follow_redirects: craig.cis_glbs.health_checks.follow_redirects,
              },
            ],
          },
        },
      ],
    }
  );
};

const ClassicGateways = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Classic Gateways",
      addText: "Create a Gateway",
      formName: "classic-gateways",
      jsonField: "classic_gateways",
    },
    {
      jsonField: "classic_gateways",
      groups: [
        {
          name: craig.classic_gateways.name,
          domain: craig.classic_gateways.domain,
          hadr: craig.classic_gateways.hadr,
        },
        {
          datacenter: craig.classic_gateways.datacenter,
          ssh_key: craig.classic_gateways.ssh_key,
          disk_key_names: craig.classic_gateways.disk_key_names,
        },
        {
          private_network_only: craig.classic_gateways.private_network_only,
          private_vlan: craig.classic_gateways.private_vlan,
          public_vlan: craig.classic_gateways.public_vlan,
        },
        {
          package_key_name: craig.classic_gateways.package_key_name,
          os_key_name: craig.classic_gateways.os_key_name,
          process_key_name: craig.classic_gateways.process_key_name,
        },
        {
          network_speed: craig.classic_gateways.network_speed,
          public_bandwidth: craig.classic_gateways.public_bandwidth,
          memory: craig.classic_gateways.memory,
        },
        {
          tcp_monitoring: craig.classic_gateways.tcp_monitoring,
          redundant_network: craig.classic_gateways.redundant_network,
          ipv6_enabled: craig.classic_gateways.ipv6_enabled,
        },
      ],
    }
  );
};

const ClassicSshKeyPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Classic SSH Keys",
      addText: "Create an SSH Key",
      jsonField: "classic_ssh_keys",
      overrideTile: craig.store.json._options.enable_classic ? undefined : (
        <ClassicDisabledTile />
      ),
      hideFormTitleButton: !craig.store.json._options.enable_classic,
    },
    {
      groups: [
        {
          name: craig.classic_ssh_keys.name,
        },
        {
          public_key: craig.classic_ssh_keys.public_key,
        },
      ],
    }
  );
};

const ClassicVlanPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Classic VLANs",
      addText: "Create a VLAN",
      jsonField: "classic_vlans",
      hideFormTitleButton: craig.store.json._options.enable_classic
        ? false
        : true,
      overrideTile: craig.store.json._options.enable_classic ? undefined : (
        <ClassicDisabledTile />
      ),
      formName: "classic-vlans",
    },
    {
      groups: [
        {
          name: craig.classic_vlans.name,
          datacenter: craig.classic_vlans.datacenter,
        },
        {
          type: craig.classic_vlans.type,
          router_hostname: craig.classic_vlans.router_hostname,
        },
      ],
    }
  );
};

const CloudDatabasePage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Cloud Databases",
      addText: "Create a Cloud Database",
      jsonField: "icd",
      formName: "icd",
    },
    {
      groups: [
        {
          use_data: craig.icd.use_data,
          name: craig.icd.name,
          service: craig.icd.service,
        },
        {
          resource_group: craig.icd.resource_group,
          plan: craig.icd.plan,
          group_id: craig.icd.group_id,
        },
        {
          memory: craig.icd.memory,
          disk: craig.icd.disk,
          cpu: craig.icd.cpu,
        },
        {
          encryption_key: craig.icd.encryption_key,
        },
      ],
    }
  );
};

const ClusterPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Clusters",
      addText: "Create a Cluster",
      jsonField: "clusters",
      formName: "clusters",
    },
    {
      jsonField: "clusters",
      groups: [
        {
          name: craig.clusters.name,
          resource_group: craig.clusters.resource_group,
          kube_type: craig.clusters.kube_type,
        },
        {
          flavor: craig.clusters.flavor,
          cos: craig.clusters.cos,
          entitlement: craig.clusters.entitlement,
        },
        {
          vpc: craig.clusters.vpc,
          subnets: craig.clusters.subnets,
          workers_per_subnet: craig.clusters.workers_per_subnet,
        },
        {
          kube_version: craig.clusters.kube_version,
          update_all_workers: craig.clusters.update_all_workers,
        },
        {
          encryption_key: craig.clusters.encryption_key,
          private_endpoint: craig.clusters.private_endpoint,
        },
      ],
      subForms: [
        {
          name: "Worker Pools",
          jsonField: "worker_pools",
          addText: "Create a Worker Pool",
          form: {
            groups: [
              {
                name: craig.clusters.worker_pools.name,
                entitlement: craig.clusters.worker_pools.entitlement,
                flavor: craig.clusters.worker_pools.flavor,
              },
              {
                subnets: craig.clusters.worker_pools.subnets,
                workers_per_subnet:
                  craig.clusters.worker_pools.workers_per_subnet,
              },
            ],
          },
        },
        {
          name: "Opaque Secrets",
          jsonField: "opaque_secrets",
          addText: "Create an Opaque Secret",
          form: {
            groups: [
              {
                name: craig.clusters.opaque_secrets.name,
                namespace: craig.clusters.opaque_secrets.namespace,
                persistence: craig.clusters.opaque_secrets.persistence,
              },
              {
                secrets_manager: craig.clusters.opaque_secrets.secrets_manager,
                secrets_group: craig.clusters.opaque_secrets.secrets_group,
                expiration_date: craig.clusters.opaque_secrets.expiration_date,
              },
              {
                labels: craig.clusters.opaque_secrets.labels,
              },
              {
                heading: {
                  type: "subHeading",
                  name: "Arbitrary Secret",
                },
              },
              {
                arbitrary_secret_name:
                  craig.clusters.opaque_secrets.arbitrary_secret_name,
                arbitrary_secret_description:
                  craig.clusters.opaque_secrets.arbitrary_secret_description,
              },
              {
                arbitrary_secret_data:
                  craig.clusters.opaque_secrets.arbitrary_secret_data,
              },
              {
                heading: {
                  type: "subHeading",
                  name: "Username Password Secret",
                },
              },
              {
                username_password_secret_name:
                  craig.clusters.opaque_secrets.username_password_secret_name,
                username_password_secret_description:
                  craig.clusters.opaque_secrets
                    .username_password_secret_description,
              },
              {
                username_password_secret_username:
                  craig.clusters.opaque_secrets
                    .username_password_secret_username,
                username_password_secret_password:
                  craig.clusters.opaque_secrets
                    .username_password_secret_password,
              },
              {
                auto_rotate: craig.clusters.opaque_secrets.auto_rotate,
              },
              {
                interval: craig.clusters.opaque_secrets.interval,
                unit: craig.clusters.opaque_secrets.unit,
              },
            ],
          },
        },
      ],
    }
  );
};

const DnsPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "DNS Service",
      addText: "Create a DNS Service Instance",
      jsonField: "dns",
      formName: "DNS",
    },
    {
      jsonField: "dns",

      groups: [
        {
          name: craig.dns.name,
          resource_group: craig.dns.resource_group,
          plan: craig.dns.plan,
        },
      ],
      subForms: [
        {
          name: "Zones",
          addText: "Create a DNS Zone",
          jsonField: "zones",
          form: {
            groups: [
              {
                name: craig.dns.zones.name,
                label: craig.dns.zones.label,
                vpcs: craig.dns.zones.vpcs,
              },
              {
                description: craig.dns.zones.description,
              },
            ],
          },
        },
        {
          name: "Records",
          addText: "Create a DNS Record",
          jsonField: "records",
          form: {
            groups: [
              {
                use_vsi: craig.dns.records.use_vsi,
                vpc: craig.dns.records.vpc,
                vsi: craig.dns.records.vsi,
              },
              {
                name: craig.dns.records.name,
                dns_zone: craig.dns.records.dns_zone,
                ttl: craig.dns.records.ttl,
              },
              {
                rdata: craig.dns.records.rdata,
                type: craig.dns.records.type,
                preference: craig.dns.records.preference,
                port: craig.dns.records.port,
              },
              {
                hideWhen: craig.dns.records.priority.hideWhen,
                protocol: craig.dns.records.protocol,
                priority: craig.dns.records.priority,
                weight: craig.dns.records.weight,
              },
              {
                hideWhen: craig.dns.records.service.hideWhen,
                service: craig.dns.records.service,
              },
            ],
          },
        },
        {
          name: "Custom Resolvers",
          addText: "Create a Custom Resolver",
          jsonField: "custom_resolvers",
          form: {
            groups: [
              {
                name: craig.dns.custom_resolvers.name,
                vpc: craig.dns.custom_resolvers.vpc,
                subnets: craig.dns.custom_resolvers.subnets,
              },
              {
                description: craig.dns.custom_resolvers.description,
              },
            ],
          },
        },
      ],
    }
  );
};

const EventStreamsPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Event Streams",
      addText: "Create an Event Streams Service",
      jsonField: "event_streams",
      formName: "Event Streams",
    },
    {
      jsonField: "event_streams",
      groups: [
        {
          name: craig.event_streams.name,
          plan: craig.event_streams.plan,
          resource_group: craig.event_streams.resource_group,
        },
        {
          throughput: craig.event_streams.throughput,
          storage_size: craig.event_streams.storage_size,
        },
        {
          private_ip_allowlist: craig.event_streams.private_ip_allowlist,
        },
      ],
    }
  );
};

const NoEdgeNetworkTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <span>
        <CloudAlerting size="24" className="iconMargin" /> No Edge Network. Go
        back to the{" "}
        <a className="no-secrets-link" href="/">
          Home page
        </a>{" "}
        to enable Edge Networking.{" "}
        <em>
          Dynamic Scalable Subnets must be disabled to create an Edge VPC
          network.
        </em>
      </span>
    </Tile>
  );
};

const F5BigIp = (craig) => {
  let templateData = {};
  let vsiData = {};
  if (craig.store.json.f5_vsi.length > 0) {
    // pass in defaults if instances exist
    vsiData = {
      resource_group: craig.store.json.f5_vsi[0].resource_group,
      ssh_keys: craig.store.json.f5_vsi[0].ssh_keys,
      image: /f5-bigip-(15-1-5-1-0-0-14|16-1-2-2-0-0-28)-(ltm|all)-1slot/.exec(
        craig.store.json.f5_vsi[0].image
      )[0], // keep only image name in props
      profile: craig.store.json.f5_vsi[0].profile,
      zones: craig.store.json.f5_vsi.length,
    };
    templateData = craig.store.json.f5_vsi[0].template;
  } else {
    vsiData = {
      zones: craig.store.json.f5_vsi.length,
    };
  }

  const F5 = () => {
    return (
      <>
        <CraigToggleForm
          name="F5 Big IP Template Configuration"
          submissionFieldName="f5_vsi_template"
          noDeleteButton
          hideHeading
          hideName
          onSave={craig.f5.template.save}
          type="formInSubForm"
          tabPanel={{ hideAbout: true }}
          craig={craig}
          innerFormProps={{
            craig: craig,
            form: {
              groups: [
                {
                  license_type: craig.f5.template.license_type,
                  tmos_admin_password: craig.f5.template.tmos_admin_password,
                },
                {
                  byol_license_basekey: craig.f5.template.byol_license_basekey,
                  license_username: craig.f5.template.license_username,
                  license_password: craig.f5.template.license_password,
                },
                {
                  license_host: craig.f5.template.license_host,
                  license_pool: craig.f5.template.license_pool,
                },
                {
                  license_unit_of_measure:
                    craig.f5.template.license_unit_of_measure,
                  license_sku_keyword_1:
                    craig.f5.template.license_sku_keyword_1,
                },
                {
                  license_sku_keyword_2:
                    craig.f5.template.license_sku_keyword_2,
                },
                {
                  template_version: craig.f5.template.template_version,
                  template_source: craig.f5.template.template_source,
                },
                {
                  app_id: craig.f5.template.app_id,
                  phone_home_url: craig.f5.template.phone_home_url,
                },
                {
                  do_declaration_url: craig.f5.template.do_declaration_url,
                  as3_declaration_url: craig.f5.template.as3_declaration_url,
                },
                {
                  ts_declaration_url: craig.f5.template.ts_declaration_url,
                  tgstandby_url: craig.f5.template.tgstandby_url,
                },
                {
                  tgrefresh_url: craig.f5.template.tgrefresh_url,
                  tgactive_url: craig.f5.template.tgactive_url,
                },
              ],
            },
            data: templateData,
          }}
        />
        <CraigToggleForm
          name="Configure F5 Big IP"
          noDeleteButton
          hideHeading
          hideName
          craig={craig}
          type="formInSubForm"
          submissionFieldName="f5_vsi"
          tabPanel={{ hideAbout: true }}
          innerFormProps={{
            data: vsiData,
            craig: craig,
            form: {
              groups: [
                {
                  zones: craig.f5.vsi.zones,
                  resource_group: craig.f5.vsi.resource_group,
                  ssh_keys: craig.f5.vsi.ssh_keys,
                },
                {
                  image: craig.f5.vsi.image,
                  profile: craig.f5.vsi.profile,
                },
              ],
            },
          }}
          onSave={craig.f5.vsi.save}
        />
      </>
    );
  };

  return craig.store.edge_pattern === undefined ? (
    <StatefulTabs
      name="F5 Big IP"
      hideFormTitleButton
      form={<NoEdgeNetworkTile />}
      about={RenderDocs("f5", craig.store.json._options.template)()}
    />
  ) : (
    <CraigToggleForm
      craig={craig}
      noSaveButton
      about={RenderDocs("f5", craig.store.json._options.template)()}
      tabPanel={{
        name: "F5 Big IP",
      }}
      noDeleteButton
      hideName
      name="F5 Big IP"
      submissionFieldName=""
      nullRef
      overrideDynamicForm={F5}
    />
  );
};

const IamAccountSettings = (craig) => {
  return (
    <CraigToggleForm
      name="IAM Account Settings"
      hide={false}
      about={RenderDocs(
        "iam_account_settings",
        craig.store.json._options.template
      )()}
      noDeleteButton={craig.store.json.iam_account_settings.enable === false}
      useAddButton={craig.store.json.iam_account_settings.enable === false}
      tabPanel={{
        name: "IAM Account Settings",
      }}
      submissionFieldName="iam_account_settings"
      hideName
      onSave={(stateData) => {
        stateData.enable = true;
        craig.iam_account_settings.save(stateData);
      }}
      onShowToggle={() => {}}
      onDelete={() => {
        craig.store.json.iam_account_settings.enable = false;
        craig.update();
      }}
      craig={craig}
      innerFormProps={{
        craig: craig,
        data: craig.store.json.iam_account_settings,
        form: {
          groups: [
            {
              if_match: craig.iam_account_settings.if_match,
              mfa: craig.iam_account_settings.mfa,
            },
            {
              include_history: craig.iam_account_settings.include_history,
              restrict_create_service_id:
                craig.iam_account_settings.restrict_create_service_id,
              restrict_create_platform_apikey:
                craig.iam_account_settings.restrict_create_platform_apikey,
            },
            {
              max_sessions_per_identity:
                craig.iam_account_settings.max_sessions_per_identity,
              session_expiration_in_seconds:
                craig.iam_account_settings.session_expiration_in_seconds,
              session_invalidation_in_seconds:
                craig.iam_account_settings.session_invalidation_in_seconds,
            },
            {
              allowed_ip_addresses:
                craig.iam_account_settings.allowed_ip_addresses,
            },
          ],
        },
      }}
    />
  );
};

const KeyManagementPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Key Management",
      addText: "Create a Key Management Service",
      jsonField: "key_management",
      formName: "kms",
    },
    {
      jsonField: "key_management",
      groups: [
        {
          use_hs_crypto: craig.key_management.use_hs_crypto,
          use_data: craig.key_management.use_data,
        },
        {
          name: craig.key_management.name,
          authorize_vpc_reader_role:
            craig.key_management.authorize_vpc_reader_role,
        },
        {
          resource_group: craig.key_management.resource_group,
        },
      ],
      subForms: [
        {
          jsonField: "keys",
          name: "Encryption Keys",
          addText: "Create an Encryption Key",
          form: {
            groups: [
              {
                name: craig.key_management.keys.name,
                key_ring: craig.key_management.keys.key_ring,
              },
              {
                force_delete: craig.key_management.keys.force_delete,
                dual_auth_delete: craig.key_management.keys.dual_auth_delete,
              },
              {
                root_key: craig.key_management.keys.root_key,
                rotation: craig.key_management.keys.rotation,
              },
              {
                endpoint: craig.key_management.keys.endpoint,
              },
            ],
          },
        },
      ],
    }
  );
};

const NetworkAclPage = (craig) => {
  return (
    <NetworkAclTemplate
      vpcs={craig.store.json.vpcs}
      docs={RenderDocs("acls", craig.store.json._options.template)}
      forceOpen={forceShowForm}
      craig={craig}
      onAclSubmit={craig.vpcs.acls.create}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      child={CopyRuleForm}
      invalidTextCallback={craig.vpcs.acls.name.invalidText}
      invalidCallback={craig.vpcs.acls.name.invalid}
      invalidRuleTextCallback={craig.vpcs.acls.rules.name.invalidText}
      invalidRuleText={craig.vpcs.acls.rules.name.invalid}
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
      docs={RenderDocs("load_balancers", craig.store.json._options.template)}
      load_balancers={craig.store.json.load_balancers}
      disableSave={disableSave}
      onDelete={craig.load_balancers.delete}
      onSave={craig.load_balancers.save}
      onSubmit={craig.load_balancers.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={craig.load_balancers.name.invalid}
      invalidTextCallback={craig.load_balancers.name.invalidText}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      vsiDeployments={craig.store.json.vsi}
    />
  );
};

const ObjectStoragePage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Object Storage",
      addText: "Create an Object Storage Service",
      jsonField: "object_storage",
      formName: "cos",
    },
    {
      jsonField: "object_storage",
      groups: [
        {
          use_data: craig.object_storage.use_data,
          use_random_suffix: craig.object_storage.use_random_suffix,
        },
        {
          name: craig.object_storage.name,
          resource_group: craig.object_storage.resource_group,
        },
        {
          plan: craig.object_storage.plan,
          kms: craig.object_storage.kms,
        },
      ],
      subForms: [
        {
          name: "Service Credentials",
          jsonField: "keys",
          addText: "Create a Service Credential",
          tooltip: {
            content:
              "A service credential allows for a service instance to connect to Object Storage.",
            link: "https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-service-credentials",
          },
          form: {
            groups: [
              {
                name: craig.object_storage.keys.name,
                role: craig.object_storage.keys.role,
              },
              {
                enable_hmac: craig.object_storage.keys.enable_hmac,
              },
            ],
          },
        },
        {
          name: "Buckets",
          jsonField: "buckets",
          addText: "Create a Bucket",
          form: {
            groups: [
              {
                name: craig.object_storage.buckets.name,
                storage_class: craig.object_storage.buckets.storage_class,
              },
              {
                kms_key: craig.object_storage.buckets.kms_key,
                force_delete: craig.object_storage.buckets.force_delete,
              },
            ],
          },
        },
      ],
    }
  );
};

const NoVpcTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> No VPCs have been
      created. Go to the
      <a className="no-vpc-link" href="/form/vpcs">
        Virtual Private Clouds Page
      </a>
      to create one.
    </Tile>
  );
};

const NoPowerNetworkTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> Power VS is not
      enabled. Return to the
      <a className="no-secrets-link" href="/">
        Options Page
      </a>{" "}
      to enable Power VS.
    </Tile>
  );
};

const NoPowerWorkspaceTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> No Power VS Workspaces.
      Go to the
      <a className="no-secrets-link" href="/form/power">
        Power VS Workspace Page
      </a>{" "}
      to create one.
    </Tile>
  );
};

const PowerInfraPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Power VS Workspace",
      addText: "Create a Workspace",
      jsonField: "power",
      overrideTile:
        craig.store.json._options.enable_power_vs !== true ? (
          <NoPowerNetworkTile />
        ) : undefined,
      hideFormTitleButton:
        craig.store.json._options.power_vs_zones.length === 0,
      formName: "Power Vs Workspace",
    },
    {
      jsonField: "power",
      setDefault: {
        images: [],
        ssh_keys: [],
      },
      groups: [
        {
          name: craig.power.name,
          resource_group: craig.power.resource_group,
        },
        {
          zone: craig.power.zone,
          imageNames: craig.power.imageNames,
        },
      ],
      subForms: [
        {
          name: "SSH Keys",
          addText: "Create an SSH Key",
          jsonField: "ssh_keys",
          form: {
            groups: [
              {
                name: craig.power.ssh_keys.name,
              },
              {
                public_key: craig.power.ssh_keys.public_key,
              },
            ],
          },
        },
        {
          name: "Power VS Subnets",
          addText: "Create a Subnet",
          jsonField: "network",
          form: {
            groups: [
              {
                name: craig.power.network.name,
                pi_network_type: craig.power.network.pi_network_type,
              },
              {
                pi_cidr: craig.power.network.pi_cidr,
                pi_dns: craig.power.network.pi_dns,
              },
              {
                pi_network_jumbo: craig.power.network.pi_network_jumbo,
              },
            ],
          },
        },
        {
          name: "Cloud Connections",
          addText: "Create a Cloud connection",
          jsonField: "cloud_connections",
          form: {
            groups: [
              {
                name: craig.power.cloud_connections.name,
                pi_cloud_connection_speed:
                  craig.power.cloud_connections.pi_cloud_connection_speed,
              },
              {
                pi_cloud_connection_global_routing:
                  craig.power.cloud_connections
                    .pi_cloud_connection_global_routing,
                pi_cloud_connection_metered:
                  craig.power.cloud_connections.pi_cloud_connection_metered,
              },
              {
                pi_cloud_connection_transit_enabled:
                  craig.power.cloud_connections
                    .pi_cloud_connection_transit_enabled,
                transit_gateways:
                  craig.power.cloud_connections.transit_gateways,
              },
            ],
          },
        },
        {
          toggleFormFieldName: "network",
          name: "Network Connections",
          hideWhen: function (stateData, componentProps) {
            return (
              contains(edgeRouterEnabledZones, componentProps.data.zone) ||
              componentProps.data.cloud_connections.length === 0
            );
          },
          hideFormTitleButton: function () {
            return true;
          },
          jsonField: "attachments",
          noDeleteButton: true,
          form: {
            groups: [
              {
                connections: craig.power.attachments.connections,
              },
            ],
          },
        },
      ],
    }
  );
};

const PowerVsInstances = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Power VS Instances",
      addText: "Create an Instance",
      jsonField: "power_instances",
      overrideTile: !craig.store.json._options.enable_power_vs ? (
        <NoPowerNetworkTile />
      ) : craig.store.json.power.length === 0 ? (
        <NoPowerWorkspaceTile />
      ) : undefined,
      hideFormTitleButton:
        !craig.store.json._options.enable_power_vs ||
        craig.store.json.power.length === 0,
      formName: "Power Instances",
      innerFormProps: {
        powerStoragePoolMap: powerStoragePoolRegionMap,
      },
    },
    {
      jsonField: "power_instances",
      setDefault: {},
      groups: [
        {
          sap: craig.power_instances.sap,
          sap_profile: craig.power_instances.sap_profile,
        },
        {
          name: craig.power_instances.name,
          workspace: craig.power_instances.workspace,
          network: craig.power_instances.network,
        },
        {
          ssh_key: craig.power_instances.ssh_key,
          image: craig.power_instances.image,
          pi_sys_type: craig.power_instances.pi_sys_type,
        },
        {
          pi_proc_type: craig.power_instances.pi_proc_type,
          pi_processors: craig.power_instances.pi_processors,
          pi_memory: craig.power_instances.pi_memory,
        },
        {
          pi_storage_pool_affinity:
            craig.power_instances.pi_storage_pool_affinity,
        },
        {
          heading: {
            name: "Boot Volume",
            type: "subHeading",
          },
        },
        {
          storage_option: craig.power_instances.storage_option,
          pi_storage_type: craig.power_instances.pi_storage_type,
          pi_storage_pool: craig.power_instances.pi_storage_pool,
          affinity_type: craig.power_instances.affinity_type,
          pi_affinity_volume: craig.power_instances.pi_affinity_volume,
          pi_anti_affinity_volume:
            craig.power_instances.pi_anti_affinity_volume,
          pi_anti_affinity_instance:
            craig.power_instances.pi_anti_affinity_instance,
          pi_affinity_instance: craig.power_instances.pi_affinity_instance,
        },
        {
          pi_user_data: craig.power_instances.pi_user_data,
        },
        {
          heading: {
            name: "IP Interface Options",
            type: "subHeading",
          },
        },
      ],
    }
  );
};

const PowerVsVolumes = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Power VS Storage Volumes",
      addText: "Create a Volume",
      jsonField: "power_volumes",
      overrideTile: !craig.store.json._options.enable_power_vs ? (
        <NoPowerNetworkTile />
      ) : craig.store.json.power.length === 0 ? (
        <NoPowerNetworkTile />
      ) : undefined,
      formName: "Power Volumes",
      hideFormTitleButton:
        !craig.store.json._options.enable_power_vs ||
        craig.store.json.power.length === 0,
      innerFormProps: {
        powerStoragePoolMap: powerStoragePoolRegionMap,
      },
    },
    {
      groups: [
        {
          name: craig.power_volumes.name,
          workspace: craig.power_volumes.workspace,
          pi_volume_size: craig.power_volumes.pi_volume_size,
        },
        {
          storage_option: craig.power_volumes.storage_option,
          pi_volume_type: craig.power_volumes.pi_volume_type,
          pi_volume_pool: craig.power_volumes.pi_volume_pool,
          affinity_type: craig.power_volumes.affinity_type,
          pi_affinity_volume: craig.power_volumes.pi_affinity_volume,
          pi_anti_affinity_volume: craig.power_volumes.pi_anti_affinity_volume,
          pi_anti_affinity_instance:
            craig.power_volumes.pi_anti_affinity_instance,
          pi_affinity_instance: craig.power_volumes.pi_affinity_instance,
        },
        {
          pi_replication_enabled: craig.power_volumes.pi_replication_enabled,
          pi_volume_shareable: craig.power_volumes.pi_volume_shareable,
          attachments: craig.power_volumes.attachments,
        },
      ],
    }
  );
};

const ResourceGroupPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Resource Groups",
      addText: "Create a Resource Group",
      formName: "Resource Groups",
      deleteDisabled: () => {
        return craig.store.json.resource_groups.length === 1;
      },
      deleteDisabledMessage: "Must have at least one resource group",
      jsonField: "resource_groups",
    },
    {
      jsonField: "resource_groups",
      groups: [
        {
          use_data: craig.resource_groups.use_data,
        },
        {
          name: craig.resource_groups.name,
          use_prefix: craig.resource_groups.use_prefix,
        },
      ],
    }
  );
};

const RoutingTablesPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Routing Tables",
      addText: "Create a Routing Table",
      formName: "routing-tables",
      jsonField: "routing_tables",
    },
    {
      jsonField: "routing_tables",
      groups: [
        {
          name: craig.routing_tables.name,
          vpc: craig.routing_tables.vpc,
        },
        {
          route_direct_link_ingress:
            craig.routing_tables.route_direct_link_ingress,
          internet_ingress: craig.routing_tables.internet_ingress,
        },
        {
          transit_gateway_ingress: craig.routing_tables.transit_gateway_ingress,
          route_vpc_zone_ingress: craig.routing_tables.route_vpc_zone_ingress,
        },
        {
          accept_routes_from_resource_type:
            craig.routing_tables.accept_routes_from_resource_type,
        },
      ],
      subForms: [
        {
          name: "Routes",
          jsonField: "routes",
          addText: "Create a Route",
          form: {
            groups: [
              {
                name: craig.routing_tables.routes.name,
                zone: craig.routing_tables.routes.zone,
                destination: craig.routing_tables.routes.destination,
              },
              {
                action: craig.routing_tables.routes.action,
                next_hop: craig.routing_tables.routes.next_hop,
              },
            ],
          },
        },
      ],
    }
  );
};

const SccV2 = (craig) => {
  return (
    <CraigToggleForm
      craig={craig}
      about={RenderDocs("scc_v2", craig.store.json._options.template)()}
      name="Security and Compliance Center"
      hideName
      noDeleteButton={
        craig.store.json.scc_v2
          ? craig.store.json.scc_v2.enable === false
          : true
      }
      onDelete={craig.scc_v2.delete}
      useAddButton={
        craig.store.json.scc_v2
          ? craig.store.json.scc_v2.enable === false
          : true
      }
      tabPanel={{
        name: "Security and Compliance Center",
      }}
      onShowToggle={() => {}}
      submissionFieldName="scc_v2"
      onSave={craig.scc_v2.save}
      innerFormProps={{
        craig: craig,
        data: craig.store.json.scc_v2,
        disableSave: disableSave,
        form: {
          jsonField: "scc_v2",
          disableSave: disableSave,
          groups: [
            {
              name: craig.scc_v2.name,
              region: craig.scc_v2.region,
              resource_group: craig.scc_v2.resource_group,
            },
          ],
          subForms: [
            {
              name: "Profile Attachments",
              jsonField: "profile_attachments",
              addText: "Create a Profile Attachment",
              hideWhen: function (stateData, componentProps) {
                return componentProps.craig.store.json.scc_v2.enable === false;
              },
              form: {
                groups: [
                  {
                    name: craig.scc_v2.profile_attachments.name,
                    profile: craig.scc_v2.profile_attachments.profile,
                  },
                  {
                    schedule: craig.scc_v2.profile_attachments.schedule,
                  },
                ],
              },
            },
          ],
        },
      }}
    />
  );
};

const SccV1 = (craig) => {
  let sccData = { ...craig.store.json.scc },
    sccEnabled = craig.store.json.scc.enable === false;
  eachKey(sccData, (key) => {
    if (sccData[key] === null) {
      sccData[key] = "";
    }
  });
  return (
    <SccV1Page
      docs={RenderDocs(
        "security_compliance_center",
        craig.store.json._options.template
      )()}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      craig={craig}
      data={sccData}
      onSave={craig.scc.save}
      useAddButton={sccEnabled}
      invalidCallback={invalidName("scc")}
      invalidTextCallback={() => {
        return genericNameCallback();
      }}
      noDeleteButton={sccEnabled}
      onDelete={() => {
        craig.store.json.scc.enable = false;
        craig.update();
      }}
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
      invalidCallback={craig.secrets_manager.name.invalid}
      invalidTextCallback={craig.secrets_manager.name.invalidText}
      secrets={craig.getAllResourceKeys()}
      docs={RenderDocs("secrets_manager", craig.store.json._options.template)}
    />
  );
};

const SecurityGroupPage = (craig) => {
  return (
    <>
      <SecurityGroupTemplate
        docs={RenderDocs("security_groups", craig.store.json._options.template)}
        security_groups={craig.store.json.security_groups}
        disableSave={disableSave}
        onDelete={craig.security_groups.delete}
        onSave={craig.security_groups.save}
        onSubmit={craig.security_groups.create}
        propsMatchState={propsMatchState}
        forceOpen={forceShowForm}
        craig={craig}
        resourceGroups={splat(craig.store.json.resource_groups, "name")}
        invalidCallback={craig.security_groups.name.invalid}
        invalidTextCallback={craig.security_groups.name.invalidText}
        disableSaveCallback={function (stateData, componentProps) {
          return (
            propsMatchState("sg_rules", stateData, componentProps) ||
            disableSave("sg_rules", stateData, componentProps)
          );
        }}
        // due to the complex table and the way these are rendered it is
        // unlikely that a dynamic form is practical to use for the creation
        // of sg rules, so I'm fine leaving these as is
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

const SubnetsPage = (craig) => {
  return (
    <SubnetPageTemplate
      vpcs={craig.store.json.vpcs}
      docs={RenderDocs("subnets", craig.store.json._options.template)}
      forceOpen={forceShowForm}
      subnetTiers={craig.store.subnetTiers}
      dynamicSubnets={craig.store.json._options.dynamic_subnets}
      subnetListCallback={(stateData, componentProps) => {
        let nextTier = [craig.store.subnetTiers[componentProps.data.name]]
          .length;
        let subnets = [];
        while (subnets.length < stateData.zones) {
          subnets.push(
            buildSubnet(
              componentProps.vpc_name,
              keys(craig.store.subnetTiers).indexOf(componentProps.vpc_name),
              stateData.name,
              nextTier,
              stateData.networkAcl,
              componentProps.data.resource_group,
              subnets.length + 1,
              stateData.addPublicGateway
            )
          );
        }
        return subnets;
      }}
      craig={craig}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      invalidSubnetTierText={craig.vpcs.subnetTiers.name.invalidText}
      invalidSubnetTierName={craig.vpcs.subnetTiers.name.invalid}
      invalidCidr={invalidCidr}
      invalidName={invalidName} // needed due to deeply rooted logic with subnet tier names
      // not changing below invalid name text for now due to complexity, likely
      // these forms will be easier to manage whem moving to dynamic forms
      invalidCidrText={invalidCidrText}
      invalidNameText={invalidNameText}
      getSubnetTierStateData={getSubnetTierStateData}
      getTierSubnets={getTierSubnets}
      onSubnetSubmit={craig.vpcs.subnetTiers}
      onSubnetSave={craig.vpcs.subnets.save}
      onSubnetTierSave={craig.vpcs.subnetTiers.save}
      onSubnetTierDelete={craig.vpcs.subnetTiers.delete}
    />
  );
};

const SshKeysPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "SSH Keys",
      addText: "Create an SSH Key",
      deleteDisabled: disableSshKeyDelete,
      deleteDisabledMessage: "SSH Key currently in use",
      jsonField: "ssh_keys",
    },
    {
      groups: [
        {
          use_data: craig.ssh_keys.use_data,
        },
        {
          name: craig.ssh_keys.name,
          resource_group: craig.ssh_keys.resource_group,
        },
        {
          public_key: craig.ssh_keys.public_key,
        },
      ],
    }
  );
};

const TransitGatewayPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Transit Gateways",
      addText: "Create a Transit Gateway",
      formName: "Transit Gateway",
      jsonField: "transit_gateways",
    },
    {
      jsonField: "transit_gateways",
      setDefault: {
        connections: [],
      },
      groups: [
        {
          use_data: craig.transit_gateways.use_data,
        },
        {
          name: craig.transit_gateways.name,
          resource_group: craig.transit_gateways.resource_group,
        },
        {
          hideWhen: function (stateData) {
            return stateData.use_data;
          },
          global: craig.transit_gateways.global,
        },
        {
          heading: {
            name: "Connections",
            type: "subHeading",
          },
        },
        {
          vpc_connections: craig.transit_gateways.vpc_connections,
          power_connections: craig.transit_gateways.power_connections,
        },
        // the patterns where existing infrastructure exists are more likely
        // to import a transit gateway than a vpc CRN. JSON-to-IaC for CRNs
        // is still supported, but will not be displayed. If we have a request
        // for that functionality, we should implement
      ],
      subForms: [
        {
          name: "GRE Tunnels",
          addText: "Create a GRE Tunnel",
          jsonField: "gre_tunnels",
          toggleFormFieldName: "gateway",
          hideFormTitleButton: function (stateData, componentProps) {
            return (
              !componentProps.craig.store.json._options.enable_classic ||
              componentProps.craig.store.json.classic_gateways.length === 0
            );
          },
          form: {
            groups: [
              {
                gateway: craig.transit_gateways.gre_tunnels.gateway,
                zone: craig.transit_gateways.gre_tunnels.zone,
              },
              {
                local_tunnel_ip:
                  craig.transit_gateways.gre_tunnels.local_tunnel_ip,
                remote_tunnel_ip:
                  craig.transit_gateways.gre_tunnels.remote_tunnel_ip,
              },
              {
                remote_bgp_asn:
                  craig.transit_gateways.gre_tunnels.remote_bgp_asn,
              },
            ],
          },
        },
        {
          name: "Prefix Filters",
          addText: "Create a Prefix Filter",
          jsonField: "prefix_filters",
          form: {
            groups: [
              {
                name: craig.transit_gateways.prefix_filters.name,
              },
              {
                connection_type:
                  craig.transit_gateways.prefix_filters.connection_type,
                target: craig.transit_gateways.prefix_filters.target,
              },
              {
                action: craig.transit_gateways.prefix_filters.action,
                prefix: craig.transit_gateways.prefix_filters.prefix,
              },
              {
                le: craig.transit_gateways.prefix_filters.le,
                ge: craig.transit_gateways.prefix_filters.ge,
              },
            ],
          },
        },
      ],
    }
  );
};

const VpnGatewayPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "VPN Gateways",
      addText: "Create a VPN Gateway",
      jsonField: "vpn_gateways",
      formName: "vpn_gateways",
      overrideTile: craig.store.vpcList.length === 0 ? <NoVpcTile /> : null,
      hideFormTitleButton: craig.store.vpcList.length === 0,
      innerFormProps: {},
    },
    {
      jsonField: "vpn_gateways",
      groups: [
        {
          name: craig.vpn_gateways.name,
          resource_group: craig.vpn_gateways.resource_group,
        },
        {
          vpc: craig.vpn_gateways.vpc,
          subnet: craig.vpn_gateways.subnet,
        },
        {
          policy_mode: craig.vpn_gateways.policy_mode,
        },
        {
          additional_prefixes: craig.vpn_gateways.additional_prefixes,
        },
      ],
      subForms: [
        {
          name: "Connections",
          addText: "Create a VPN Gateway Connection",
          jsonField: "connections",
          form: {
            groups: [
              {
                name: craig.vpn_gateways.connections.name,
              },
              {
                peer_cidrs: craig.vpn_gateways.connections.peer_cidrs,
              },
              {
                local_cidrs: craig.vpn_gateways.connections.local_cidrs,
              },
            ],
          },
        },
      ],
    }
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
      invalidCallback={craig.vpn_servers.name.invalid}
      invalidTextCallback={craig.vpn_servers.name.invalidText}
      craig={craig}
      docs={RenderDocs("vpn_servers", craig.store.json._options.template)}
      invalidCidrBlock={invalidCidrBlock}
      invalidCrnList={invalidCrnList}
      onRouteSave={craig.vpn_servers.routes.save}
      onRouteDelete={craig.vpn_servers.routes.delete}
      onRouteSubmit={craig.vpn_servers.routes.create}
      invalidRouteCallback={craig.vpn_servers.routes.name.invalid}
      invalidRouteTextCallback={craig.vpn_servers.routes.name.invalidText}
      subnetList={craig.getAllSubnets()}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      helperTextCallback={vpnServersHelperText}
      secretsManagerList={splat(craig.store.json.secrets_manager, "name")}
    />
  );
};

const VpcPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Virtual Private Clouds",
      addText: "Create a VPC",
      jsonField: "vpcs",
      formName: "vpcs",
    },
    {
      setDefault: {
        public_gateways: [],
        publicGateways: [],
      },
      groups: [
        {
          name: craig.vpcs.name,
          resource_group: craig.vpcs.resource_group,
          bucket: craig.vpcs.bucket,
        },
        {
          default_network_acl_name: craig.vpcs.default_network_acl_name,
          default_security_group_name: craig.vpcs.default_security_group_name,
          default_routing_table_name: craig.vpcs.default_routing_table_name,
        },
        {
          heading: {
            name: "Public Gateways",
            type: "subHeading",
            tooltip: {
              content:
                "Public Gateways allow for all resources in a zone to communicate with the public internet. Public Gateways are not needed for subnets where a VPN gateway is created.",
            },
          },
        },
        {
          pgw_zone_1: craig.vpcs.pgw_zone_1,
          pgw_zone_2: craig.vpcs.pgw_zone_2,
          pgw_zone_3: craig.vpcs.pgw_zone_3,
        },
        {
          heading: {
            name: "Classic Access",
            type: "subHeading",
          },
        },
        {
          classic_access: craig.vpcs.classic_access,
        },
      ],
    }
  );
};

const VpePage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "Virtual Private Endpoints",
      addText: "Create a VPE",
      jsonField: "virtual_private_endpoints",
      formName: "Virtual Private Endpoints",
      overrideTile:
        craig.store.vpcList.length === 0 ? <NoVpcTile /> : undefined,
    },
    {
      jsonField: "virtual_private_endpoints",
      groups: [
        {
          name: craig.virtual_private_endpoints.name,
          vpc: craig.virtual_private_endpoints.vpc,
          service: craig.virtual_private_endpoints.service,
        },
        {
          resource_group: craig.virtual_private_endpoints.resource_group,
          security_groups: craig.virtual_private_endpoints.security_groups,
          subnets: craig.virtual_private_endpoints.subnets,
        },
        {
          instance: craig.virtual_private_endpoints.instance,
        },
      ],
    }
  );
};

const VsiPage = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "VSI",
      addText: "Create a VSI",
      jsonField: "vsi",
      formName: "vsi",
    },
    {
      jsonField: "vsi",
      groups: [
        {
          name: craig.vsi.name,
          resource_group: craig.vsi.resource_group,
        },
        {
          vpc: craig.vsi.vpc,
          subnets: craig.vsi.subnets,
          security_groups: craig.vsi.security_groups,
        },
        {
          vsi_per_subnet: craig.vsi.vsi_per_subnet,
          image_name: craig.vsi.image_name,
          profile: craig.vsi.profile,
        },
        {
          ssh_keys: craig.vsi.ssh_keys,
          encryption_key: craig.vsi.encryption_key,
        },
        {
          enable_floating_ip: craig.vsi.enable_floating_ip,
          primary_interface_ip_spoofing:
            craig.vsi.primary_interface_ip_spoofing,
        },
        {
          user_data: craig.vsi.user_data,
        },
      ],
      subForms: [
        {
          name: "Block Storage Volumes",
          addText: "Create a Block Storage Volume",
          jsonField: "volumes",
          form: {
            groups: [
              {
                name: craig.vsi.volumes.name,
                profile: craig.vsi.volumes.profile,
              },
              {
                encryption_key: craig.vsi.volumes.encryption_key,
                capacity: craig.vsi.volumes.capacity,
              },
            ],
          },
        },
      ],
    }
  );
};

const Vtl = (craig) => {
  return formPageTemplate(
    craig,
    {
      name: "FalconStor VTL Instances",
      addText: "Create an Instance",
      jsonField: "vtl",
      overrideTile: !craig.store.json._options.enable_power_vs ? (
        <NoPowerNetworkTile />
      ) : craig.store.json.power.length === 0 ? (
        <NoPowerWorkspaceTile />
      ) : undefined,
      hideFormTitleButton:
        !craig.store.json._options.enable_power_vs ||
        craig.store.json.power.length === 0,
      formName: "VTL",
      innerFormProps: {
        powerStoragePoolMap: powerStoragePoolRegionMap,
      },
    },
    {
      jsonField: "vtl",
      setDefault: {},
      groups: [
        {
          name: craig.vtl.name,
          workspace: craig.vtl.workspace,
          network: craig.vtl.network,
        },
        {
          ssh_key: craig.vtl.ssh_key,
          image: craig.vtl.image,
          pi_sys_type: craig.vtl.pi_sys_type,
        },
        {
          pi_proc_type: craig.vtl.pi_proc_type,
          pi_processors: craig.vtl.pi_processors,
          pi_memory: craig.vtl.pi_memory,
        },
        {
          pi_license_repository_capacity:
            craig.vtl.pi_license_repository_capacity,
          pi_storage_pool_affinity: craig.vtl.pi_storage_pool_affinity,
        },
        {
          heading: {
            name: "Boot Volume",
            type: "subHeading",
          },
        },
        {
          storage_option: craig.vtl.storage_option,
          pi_storage_type: craig.vtl.pi_storage_type,
          pi_storage_pool: craig.vtl.pi_storage_pool,
          affinity_type: craig.vtl.affinity_type,
          pi_affinity_volume: craig.vtl.pi_affinity_volume,
          pi_anti_affinity_volume: craig.vtl.pi_anti_affinity_volume,
          pi_anti_affinity_instance: craig.vtl.pi_anti_affinity_instance,
          pi_affinity_instance: craig.vtl.pi_affinity_instance,
        },
        {
          heading: {
            name: "IP Interface Options",
            type: "subHeading",
          },
        },
      ],
    }
  );
};

export const NewFormPage = (props) => {
  let { form, craig } = props;

  if (form === "accessGroups") {
    return AccessGroupsPage(craig);
  } else if (form === "appID") {
    return AppIdPage(craig);
  } else if (form === "activityTracker") {
    return Atracker(craig);
  } else if (form === "cis") {
    return Cis(craig);
  } else if (form === "cisGlbs") {
    return CisGlbs(craig);
  } else if (form === "classicGateways") {
    return ClassicGateways(craig);
  } else if (form === "classicSshKeys") {
    return ClassicSshKeyPage(craig);
  } else if (form === "classicVlans") {
    return ClassicVlanPage(craig);
  } else if (form === "icd") {
    return CloudDatabasePage(craig);
  } else if (form === "clusters") {
    return ClusterPage(craig);
  } else if (form === "dns") {
    return DnsPage(craig);
  } else if (form === "eventStreams") {
    return EventStreamsPage(craig);
  } else if (form === "f5") {
    return F5BigIp(craig);
  } else if (form === "iamAccountSettings") {
    return IamAccountSettings(craig);
  } else if (form === "keyManagement") {
    return KeyManagementPage(craig);
  } else if (form === "lb") {
    return LoadBalancerPage(craig);
  } else if (form === "nacls") {
    return NetworkAclPage(craig);
  } else if (form === "objectStorage") {
    return ObjectStoragePage(craig);
  } else if (form === "power") {
    return PowerInfraPage(craig);
  } else if (form === "powerInstances") {
    return PowerVsInstances(craig);
  } else if (form === "powerVolumes") {
    return PowerVsVolumes(craig);
  } else if (form === "resourceGroups") {
    return ResourceGroupPage(craig);
  } else if (form === "securityComplianceCenter") {
    return SccV1(craig);
  } else if (form === "sccV2") {
    return SccV2(craig);
  } else if (form === "secretsManager") {
    return SecretsManagerPage(craig);
  } else if (form === "routingTables") {
    return RoutingTablesPage(craig);
  } else if (form === "securityGroups") {
    return SecurityGroupPage(craig);
  } else if (form === "sshKeys") {
    return SshKeysPage(craig);
  } else if (form === "subnets") {
    return SubnetsPage(craig);
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
  } else if (form === "vtl") {
    return Vtl(craig);
  }
};
