import React from "react";
import {
  PrimaryButton,
  CraigFormHeading,
  RenderForm,
  StatefulTabs,
} from "../../forms/utils";
import {
  BareMetalServer_02,
  GatewayVpn,
  IbmCloudKubernetesService,
  IbmCloudVpcEndpoints,
  NetworkEnterprise,
  Password,
  Security,
  ServerProxy,
  LoadBalancerVpc,
  AppConnectivity,
  Router,
  IbmCloudVpc,
} from "@carbon/icons-react";
import {
  clusterTf,
  disableSave,
  f5Tf,
  lbTf,
  propsMatchState,
  routingTableTf,
  sgTf,
  sshKeyTf,
  vpeTf,
  vpnTf,
  vsiTf,
} from "../../../lib";
import {
  arraySplatIndex,
  azsort,
  contains,
  isNullOrEmptyString,
  snakeCase,
  titleCase,
} from "lazy-z";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import DynamicForm from "../../forms/DynamicForm";
import { craigForms } from "../CraigForms";
import {
  SshKeys,
  SubnetServiceMap,
  SubnetTierMap,
  VpcMap,
  SecurityGroups,
  docTabs,
} from "../diagrams";
import { NoSecretsManagerTile } from "../../utils/NoSecretsManagerTile";
import {
  CraigEmptyResourceTile,
  NoVpcVsiTile,
} from "../../forms/dynamic-form/tiles";
import { RoutingTables } from "../diagrams/RoutingTables";
import { F5BigIp } from "../FormPages";
import f5 from "../../../images/f5.png";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";
import { PassThroughHoverWrapper } from "../diagrams/PassthroughWrapper";
import { ScrollFormWrapper } from "../diagrams/ScrollFormWrapper";
import { fortigateTf } from "../../../lib/json-to-iac/fortigate";
import { vpnServerTf } from "../../../lib/json-to-iac";
import { DynamicFormSelect } from "../../forms/dynamic-form";
import { CopyRuleForm } from "../../forms";

function F5Icon() {
  return <img src={f5} className="vpcDeploymentIcon" />;
}

class VpcDeploymentsDiagramPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: "",
      selectedIndex: -1,
      vpcIndex: -1,
      editing: false,
      showModal: false,
    };
    this.setSelection = this.setSelection.bind(this);
    this.resetSelection = this.resetSelection.bind(this);
    this.onItemDelete = this.onItemDelete.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.tabSelected = this.tabSelected.bind(this);
    this.onSgTabClick = this.onSgTabClick.bind(this);
    this.vpcName = this.vpcName.bind(this);
    this.selectRenderValue = this.selectRenderValue.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.onSshKeyButtonClick = this.onSshKeyButtonClick.bind(this);
    this.getServiceData = this.getServiceData.bind(this);
  }

  getServiceData() {
    let craig = this.props.craig;
    if (this.state.selectedItem === "f5_vsi") {
      let templateData = {};
      let vsiData = {};
      if (craig.store.json.f5_vsi.length > 0) {
        // pass in defaults if instances exist
        vsiData = {
          resource_group: craig.store.json.f5_vsi[0].resource_group,
          ssh_keys: craig.store.json.f5_vsi[0].ssh_keys,
          image:
            /f5-bigip-(15-1-5-1-0-0-14|16-1-2-2-0-0-28)-(ltm|all)-1slot/.exec(
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
      return {
        templateData,
        vsiData,
      };
    } else {
      return craig.store.json[this.state.selectedItem][
        this.state.selectedIndex
      ];
    }
  }

  onSshKeyButtonClick() {
    this.resetSelection();
    this.setState({
      selectedItem: "ssh_keys",
      showModal: true,
    });
  }

  getIcon(field) {
    return field === "routing_tables"
      ? Router
      : field === "fortigate_vnf"
      ? AppConnectivity
      : field === "load_balancers"
      ? LoadBalancerVpc
      : field === "vpn_servers"
      ? ServerProxy
      : field === "security_groups"
      ? Security
      : field === "ssh_keys"
      ? Password
      : field === "vpn_gateways"
      ? GatewayVpn
      : field === "vsi"
      ? BareMetalServer_02
      : field === "clusters"
      ? IbmCloudKubernetesService
      : IbmCloudVpcEndpoints;
  }

  vpcName() {
    try {
      return this.props.craig.store.json.vpcs[this.state.vpcIndex].name;
    } catch (err) {
      return "";
    }
  }

  /**
   * tab selected
   * @param {string} sgName
   * @returns {boolean} true if selected
   */
  tabSelected(sgName) {
    return (
      arraySplatIndex(
        this.props.craig.store.json.security_groups,
        "name",
        sgName
      ) === this.state.selectedIndex &&
      this.state.selectedItem === "security_groups"
    );
  }

  /**
   * handle click on sg tab
   * @param {*} sgName
   */
  onSgTabClick(vpcIndex) {
    return (sgName) => {
      this.resetSelection();
      this.setSelection(
        vpcIndex,
        "security_groups",
        arraySplatIndex(
          this.props.craig.store.json.security_groups,
          "name",
          sgName
        )
      );
    };
  }

  /**
   * on delete item wrapper to prevent errors
   * @param {*} stateData
   * @param {*} componentProps
   */
  onItemDelete(stateData, componentProps) {
    this.props.craig[this.state.selectedItem].delete(stateData, componentProps);
    this.resetSelection();
  }

  handleInputChange(event) {
    let { name, value } = event.target;
    this.setState({
      [name]:
        value === "VSI"
          ? "vsi"
          : value === "Fortigate VNF"
          ? "fortigate_vnf"
          : snakeCase(value) + "s",
    });
  }

  resetSelection() {
    this.setState({
      vpcIndex: -1,
      editing: false,
      selectedItem: "",
      selectedIndex: -1,
      showModal: false,
    });
  }

  /**
   * set selection
   * @param {number} vpcIndex
   * @param {string} type
   * @param {number} index
   */
  setSelection(vpcIndex, type, index) {
    if (
      vpcIndex === this.state.vpcIndex &&
      type === this.state.selectedItem &&
      index === this.state.selectedIndex
    ) {
      this.resetSelection();
    } else {
      this.resetSelection();
      this.setState({
        vpcIndex: vpcIndex,
        selectedItem: type,
        selectedIndex: index,
        editing: true,
      });
    }
  }

  selectRenderValue() {
    return this.state.selectedItem === "fortigate_vnf"
      ? "Fortigate VNF"
      : this.state.selectedItem === "vsi"
      ? "VSI"
      : this.state.selectedItem === "vpn_servers"
      ? "VPN Server"
      : this.state.selectedItem === "vpn_gateways"
      ? "VPN Gateway"
      : this.state.selectedItem === "ssh_keys"
      ? "SSH Key"
      : titleCase(this.state.selectedItem).replace(/s$/g, "");
  }

  render() {
    let craig = this.props.craig;
    const forms = craigForms(craig);
    let noSelectedItem = isNullOrEmptyString(this.state.selectedItem, true);
    return (
      <>
        <DynamicFormModal
          name={
            this.state.selectedItem === "ssh_keys"
              ? "Create an SSH Key"
              : `Create a Deployment in ${this.vpcName()}`
          }
          beginDisabled
          show={this.state.showModal}
          onRequestClose={this.resetSelection}
          onRequestSubmit={
            noSelectedItem
              ? () => {}
              : (stateData, componentProps) => {
                  craig[this.state.selectedItem].create(
                    stateData,
                    componentProps
                  );
                  this.resetSelection();
                }
          }
        >
          <DynamicFormSelect
            name="selectedItem"
            propsName="VPC Deployment"
            keyIndex={0}
            value={this.state.selectedItem}
            field={{
              labelText: "Deployment Type",
              groups: [
                "Cluster",
                "Fortigate VNF",
                "Security Group",
                "SSH Key",
                "Virtual Private Endpoint",
                "Load Balancer",
                "VPN Gateway",
                "VPN Server",
                "VSI",
                "Routing Table",
              ].sort(azsort),
              disabled: (stateData) => {
                return false;
              },
              invalid: (stateData) => {
                return isNullOrEmptyString(stateData.selectedItem);
              },
              invalidText: (stateData) => {
                return "Invalid Selection";
              },
              onRender: this.selectRenderValue,
            }}
            parentProps={this.props}
            parentState={this.state}
            handleInputChange={this.handleInputChange}
          />
          <div className="marginBottomSmall" />
          {noSelectedItem ? (
            // need to pass html element
            <></>
          ) : (
            <CraigFormHeading
              name={
                this.state.selectedItem === "ssh_keys"
                  ? "New SSH Key"
                  : "New " + this.selectRenderValue() + " Deployment"
              }
              type="subHeading"
              className="marginBottomSmall"
            />
          )}
          {noSelectedItem ? (
            // need to pass html element
            <></>
          ) : this.state.selectedItem === "load_balancers" &&
            craig.store.json.vsi.length === 0 ? (
            <NoVpcVsiTile />
          ) : this.state.selectedItem === "vpn_servers" &&
            craig.store.json.secrets_manager.length === 0 ? (
            <NoSecretsManagerTile />
          ) : contains(["fortigate_vnf", "vsi"], this.state.selectedItem) &&
            craig.store.json.ssh_keys.length === 0 ? (
            <CraigEmptyResourceTile
              name="VPC SSH keys. To enable creation of this resource, create an SSH key"
              noClick
            />
          ) : (
            <DynamicForm
              key={this.state.selectedItem}
              className="formInSubForm"
              isModal
              form={forms[this.state.selectedItem]}
              craig={craig}
              selectedItem={this.state.selectedItem}
              data={{
                vpc:
                  this.state.selectedItem === "ssh_keys" ||
                  this.state.vpcIndex === -1
                    ? undefined
                    : this.vpcName(),
                subnets: [],
                security_groups: contains(
                  ["vsi", "virtual_private_endpoints"],
                  this.state.selectedItem
                )
                  ? []
                  : undefined,
                public_key:
                  this.state.selectedItem === "ssh_keys" ? "" : undefined,
                ssh_keys: [],
              }}
              shouldDisableSubmit={function () {
                if (isNullOrEmptyString(this.props.selectedItem, true)) {
                  this.props.disableModal();
                } else if (
                  disableSave(
                    this.props.selectedItem,
                    this.state,
                    this.props
                  ) === false
                ) {
                  this.props.enableModal();
                } else {
                  this.props.disableModal();
                }
              }}
            />
          )}
        </DynamicFormModal>
        <div className="marginRight1Rem">
          <StatefulTabs
            h2
            icon={
              <IbmCloudVpc
                style={{ marginTop: "0.4rem", marginRight: "0.5rem" }}
                size="20"
              />
            }
            name="VPC Deployments"
            formName="VPC Deployments"
            tfTabs={[
              {
                name: "Clusters",
                tf: clusterTf(craig.store.json),
              },
              {
                name: "F5 Big IP",
                tf: f5Tf(craig.store.json),
              },
              {
                name: "Fortigate VNF",
                tf: fortigateTf(craig.store.json) || "",
              },
              {
                name: "Load Balancers",
                tf: lbTf(craig.store.json),
              },
              {
                name: "Routing Tables",
                tf: routingTableTf(craig.store.json),
              },
              {
                name: "Security Groups",
                tf: sgTf(craig.store.json),
              },
              {
                name: "SSH Keys",
                tf:
                  craig.store.json.ssh_keys.length === 0
                    ? ""
                    : sshKeyTf(craig.store.json),
              },
              {
                name: "Virtual Servers",
                tf: vsiTf(craig.store.json),
              },
              {
                name: "Virtual Private Endpoints",
                tf: vpeTf(craig.store.json),
              },
              {
                name: "VPN Gateways",
                tf: vpnTf(craig.store.json),
              },
              {
                name: "VPN Servers",
                tf: vpnServerTf(craig.store.json),
              },
            ]}
            nestedDocs={docTabs(
              [
                "SSH Keys",
                "Clusters",
                "Security Groups",
                "Virtual Servers",
                "Virtual Private Endpoints",
                "VPN Gateways",
                "VPN Servers",
                "Load Balancers",
              ]
                .sort(azsort)
                .concat("F5 Big IP"), // have f5 always be last
              craig
            )}
            form={
              <>
                <div className="width580">
                  <CraigFormHeading
                    name="Deployments"
                    noMarginBottom
                    buttons={
                      <PrimaryButton
                        type="add"
                        hoverText="Create a Deployment"
                        noDeleteButton
                        onClick={() => {
                          this.resetSelection();
                          this.setState({
                            showModal: true,
                          });
                        }}
                      />
                    }
                  />
                </div>
                <div className="displayFlex">
                  <div id="left-vpc-deployments">
                    <HoverClassNameWrapper
                      key={
                        String(this.state.vpcIndex) +
                        String(this.state.editing) +
                        String(this.state.selectedItem) +
                        "new-ssh-keys"
                      }
                      hoverClassName="diagramBoxSelected"
                      className="width580"
                    >
                      <SshKeys
                        craig={craig}
                        onKeyClick={(sshKeyIndex) =>
                          this.setSelection(-1, "ssh_keys", sshKeyIndex)
                        }
                        isSelected={(props) => {
                          return (
                            this.state.selectedItem === props.itemName &&
                            this.state.selectedIndex === props.itemIndex &&
                            this.state.vpcIndex === props.vpcIndex
                          );
                        }}
                      />
                    </HoverClassNameWrapper>
                    <VpcMap
                      craig={craig}
                      isSelected={(vpcIndex) => {
                        return vpcIndex === this.state.vpcIndex;
                      }}
                      onImportedSubnetItemClick={(
                        vpcIndex,
                        field,
                        itemIndex
                      ) => {
                        this.setSelection(vpcIndex, field, itemIndex);
                      }}
                      parentState={this.state}
                      tabSelected={this.tabSelected}
                      onTabClick={this.onSgTabClick}
                    >
                      <RoutingTables
                        craig={craig}
                        isSelected={(props) => {
                          return (
                            this.state.selectedItem === props.itemName &&
                            this.state.selectedIndex === props.itemIndex &&
                            this.state.vpcIndex === props.vpcIndex
                          );
                        }}
                        onClick={(vpcIndex, rtIndex) => {
                          this.setSelection(
                            vpcIndex,
                            "routing_tables",
                            rtIndex
                          );
                        }}
                      />
                      <SecurityGroups
                        craig={craig}
                        isSelected={(props) => {
                          return (
                            this.state.selectedItem === props.itemName &&
                            this.state.selectedIndex === props.itemIndex &&
                            this.state.vpcIndex === props.vpcIndex
                          );
                        }}
                        onClick={(vpcIndex, sgIndex) => {
                          this.setSelection(
                            vpcIndex,
                            "security_groups",
                            sgIndex
                          );
                        }}
                      />
                      <PassThroughHoverWrapper
                        className="formInSubForm"
                        hoverClassName="diagramBoxSelected"
                      >
                        <CraigFormHeading
                          icon={
                            <NetworkEnterprise className="diagramTitleIcon" />
                          }
                          type="subHeading"
                          name="Network"
                        />
                        <SubnetTierMap
                          grayNames
                          craig={craig}
                          renderChildren={
                            <SubnetServiceMap
                              onClick={(vpcIndex, field, itemIndex) => {
                                this.setSelection(vpcIndex, field, itemIndex);
                              }}
                              craig={craig}
                              parentState={this.state}
                              tabSelected={this.tabSelected}
                              onTabClick={this.onSgTabClick}
                            />
                          }
                        />
                      </PassThroughHoverWrapper>
                    </VpcMap>
                  </div>
                  <div id="right-vpc-deployments">
                    <ScrollFormWrapper>
                      {this.state.editing &&
                      this.state.selectedItem === "f5_vsi" ? (
                        <div className="rightForm marginTop1Rem">
                          <CraigFormHeading
                            icon={<F5Icon />}
                            name="Editing F5 Big IP Deployment"
                          />
                          <div className="subForm">{F5BigIp(craig, true)}</div>
                        </div>
                      ) : this.state.editing === true ? (
                        <div>
                          <CraigFormHeading
                            icon={RenderForm(
                              this.getIcon(this.state.selectedItem),
                              {
                                className: "vpcDeploymentIcon",
                              }
                            )}
                            noMarginBottom
                            name={`Editing ${
                              this.state.selectedItem === "ssh_keys"
                                ? "SSH Keys"
                                : this.selectRenderValue()
                            }${
                              contains(
                                ["security_groups", "ssh_keys"],
                                this.state.selectedItem
                              )
                                ? ""
                                : " Deployment"
                            } ${
                              craig.store.json[this.state.selectedItem][
                                this.state.selectedIndex
                              ].name
                            }`}
                          />
                          <CraigToggleForm
                            key={
                              this.state.selectedItem +
                              this.state.selectedIndex +
                              this.state.vpcIndex
                            }
                            tabPanel={{ hideAbout: true }}
                            onSave={craig[this.state.selectedItem].save}
                            onDelete={this.onItemDelete}
                            hideChevron
                            hideName
                            hide={false}
                            name={
                              craig.store.json[this.state.selectedItem][
                                this.state.selectedIndex
                              ].name
                            }
                            submissionFieldName={this.state.selectedItem}
                            innerFormProps={{
                              form: forms[this.state.selectedItem],
                              craig: craig,
                              data: this.getServiceData(),
                              // need to be passed to render child forms
                              disableSave: disableSave,
                              propsMatchState: propsMatchState,
                              vpc_name: this.vpcName(),
                            }}
                          />
                          {this.state.selectedItem === "security_groups" &&
                          !craig.store.json[this.state.selectedItem][
                            this.state.selectedIndex
                          ].use_data ? (
                            <CopyRuleForm
                              craig={this.props.craig}
                              sourceSg={this.getServiceData().name}
                              isAclForm={false}
                              v2={true}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      ) : (
                        ""
                      )}
                    </ScrollFormWrapper>
                  </div>
                </div>
              </>
            }
          />
        </div>
      </>
    );
  }
}

export default VpcDeploymentsDiagramPage;
