import React from "react";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import {
  CraigFormHeading,
  PrimaryButton,
} from "../../forms/utils/ToggleFormComponents";
import {
  BareMetalServer_02,
  GatewayVpn,
  IbmCloudKubernetesService,
  IbmCloudVpcEndpoints,
  NetworkEnterprise,
  Password,
  Security,
  VirtualPrivateCloud,
} from "@carbon/icons-react";
import { disableSave, getTierSubnets, propsMatchState } from "../../../lib";
import { SubnetBox, DeploymentIcon } from "./DisplayComponents";
import {
  arraySplatIndex,
  buildNumberDropdownList,
  contains,
  isNullOrEmptyString,
  snakeCase,
  titleCase,
} from "lazy-z";
import { IcseSelect, RenderForm } from "icse-react-assets";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import DynamicForm from "../../forms/DynamicForm";
import { RenderDocs } from "../SimplePages";
import { craigForms } from "../CraigForms";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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
      [name]: value === "VSI" ? "vsi" : snakeCase(value) + "s",
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
      scrollToTop();
      this.resetSelection();
      this.setState({
        vpcIndex: vpcIndex,
        selectedItem: type,
        selectedIndex: index,
        editing: true,
      });
    }
  }

  render() {
    let craig = this.props.craig;
    const forms = craigForms(craig);
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
            isNullOrEmptyString(this.state.selectedItem)
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
          <IcseSelect
            formName="VPC Deployment"
            value={
              this.state.selectedItem === "vsi"
                ? "VSI"
                : this.state.selectedItem === "vpn_gateways"
                ? "VPN Gateway"
                : this.state.selectedItem === "ssh_keys"
                ? "SSH Key"
                : titleCase(this.state.selectedItem).replace(/s$/g, "")
            }
            labelText="Deployment Type"
            name="selectedItem"
            groups={[
              "Cluster",
              "Security Group",
              "SSH Key",
              "Virtual Private Endpoint",
              "VPN Gateway",
              "VSI",
            ]}
            handleInputChange={this.handleInputChange}
          />
          <div className="marginBottomSmall" />
          {isNullOrEmptyString(this.state.selectedItem, true) ? (
            // need to pass html element
            <></>
          ) : (
            <CraigFormHeading
              name={
                this.state.selectedItem === "ssh_keys"
                  ? "New SSH Key"
                  : "New " +
                    (this.state.selectedItem === "vsi"
                      ? "VSI"
                      : this.state.selectedItem === "vpn_gateways"
                      ? "VPN Gateway"
                      : titleCase(this.state.selectedItem)
                    ).replace(/s$/g, "") +
                    " Deployment"
              }
            />
          )}
          {isNullOrEmptyString(this.state.selectedItem, true) ? (
            // need to pass html element
            <></>
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
        <div
          style={{
            marginRight: "1rem",
            marginTop: "1rem",
          }}
        >
          <StatefulTabs
            name="VPC Deployments"
            overrideTabs={[
              {
                name: "Manage Deployments",
              },
              {
                name: "SSH Keys",
                about: RenderDocs(
                  "ssh_keys",
                  craig.store.json._options.template
                ),
              },
              {
                name: "Clusters",
                about: RenderDocs(
                  "clusters",
                  craig.store.json._options.template
                ),
              },
              {
                name: "Security Groups",
                about: RenderDocs(
                  "security_groups",
                  craig.store.json._options.template
                ),
              },
              {
                name: "Virtual Servers",
                about: RenderDocs("vsi", craig.store.json._options.template),
              },
              {
                name: "Virtual Private Endpoints",
                about: RenderDocs(
                  "virtual_private_endpoints",
                  craig.store.json._options.template
                ),
              },
              {
                name: "VPN Gateways",
                about: RenderDocs(
                  "vpn_gateways",
                  craig.store.json._options.template
                ),
              },
            ]}
            form={
              <>
                <div className="marginBottomSmall" />
                <CraigFormHeading name="Deployments" noMarginBottom />
                <div className="displayFlex" style={{ width: "100%" }}>
                  <div id="left-vpc-deployments">
                    <div
                      className="subForm marginBottomSmall"
                      key={
                        this.state.vpcIndex +
                        this.state.editing +
                        this.state.selectedItem
                      }
                      style={{
                        marginRight: "1rem",
                        width: "580px",
                      }}
                    >
                      <CraigFormHeading
                        icon={
                          <Password
                            style={{
                              marginRight: "0.5rem",
                              marginTop: "0.33rem",
                            }}
                          />
                        }
                        type="subHeading"
                        name="VPC SSH Keys"
                        buttons={
                          <PrimaryButton
                            type="add"
                            hoverText="Create an SSH Key"
                            noDeleteButton
                            onClick={() => {
                              this.resetSelection();
                              this.setState({
                                selectedItem: "ssh_keys",
                                showModal: true,
                              });
                            }}
                          />
                        }
                      />
                      <div className="formInSubForm">
                        {craig.store.json.ssh_keys.length === 0 &&
                          "No VPC SSH Keys"}
                        {craig.store.json.ssh_keys.map(
                          (sshKey, sshKeyIndex) => (
                            <div style={{ textAlign: "center" }}>
                              <DeploymentIcon
                                craig={craig}
                                parentState={this.state}
                                itemName="ssh_keys"
                                itemIndex={sshKeyIndex}
                                item={sshKey}
                                icon={Password}
                                vpcIndex={-1}
                                onClick={() => {
                                  this.setSelection(
                                    -1,
                                    "ssh_keys",
                                    sshKeyIndex
                                  );
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    {craig.store.json.vpcs.map((vpc, vpcIndex) => (
                      <div
                        className="subForm marginBottomSmall"
                        key={
                          vpc.name + this.state.vpcIndex + this.state.editing
                        }
                        style={{
                          marginRight: "1rem",
                          width: "580px",
                          boxShadow:
                            vpcIndex === this.state.vpcIndex
                              ? " 0 10px 14px 0 rgba(0, 0, 0, 0.24),0 17px 50px 0 rgba(0, 0, 0, 0.19)"
                              : "",
                        }}
                      >
                        <CraigFormHeading
                          icon={
                            <VirtualPrivateCloud
                              style={{
                                marginRight: "0.5rem",
                                marginTop: "0.33rem",
                              }}
                            />
                          }
                          type="subHeading"
                          name={vpc.name + " VPC"}
                          buttons={
                            <PrimaryButton
                              type="add"
                              hoverText="Create a Service Deployment"
                              noDeleteButton
                              onClick={() => {
                                this.resetSelection();
                                this.setState({
                                  vpcIndex: vpcIndex,
                                  showModal: true,
                                });
                              }}
                            />
                          }
                        />
                        <div className="formInSubForm marginBottomSmall">
                          <CraigFormHeading
                            icon={
                              <Security
                                style={{
                                  marginRight: "0.5rem",
                                  marginTop: "0.33rem",
                                }}
                              />
                            }
                            name="Security Groups"
                            type="subHeading"
                            noMarginBottom
                          />
                          <div className="displayFlex alignItemCenter">
                            {craig.store.json.security_groups.map(
                              (sg, sgIndex) => {
                                if (sg.vpc === vpc.name)
                                  return (
                                    <div
                                      className="fieldWidthSmaller"
                                      style={{
                                        textAlign: "center",
                                        margin: "0.5rem",
                                        padding: "0.5rem",
                                        width: "150px",
                                      }}
                                    >
                                      <DeploymentIcon
                                        craig={craig}
                                        icon={Security}
                                        item={sg}
                                        parentState={this.state}
                                        itemIndex={sgIndex}
                                        itemName="security_groups"
                                        vpcIndex={vpcIndex}
                                        onClick={() =>
                                          this.setSelection(
                                            vpcIndex,
                                            "security_groups",
                                            sgIndex
                                          )
                                        }
                                      />
                                    </div>
                                  );
                              }
                            )}
                          </div>
                        </div>
                        <div className="formInSubForm">
                          <CraigFormHeading
                            icon={
                              <NetworkEnterprise
                                style={{
                                  marginRight: "0.5rem",
                                  marginTop: "0.33rem",
                                }}
                              />
                            }
                            type="subHeading"
                            name="Network"
                          />
                          {craig.store.subnetTiers[vpc.name].map(
                            (tier, tierIndex) => {
                              let tierSubnets = getTierSubnets(tier, vpc)(tier);
                              return (
                                <div
                                  key={vpc.name + tierIndex}
                                  style={{
                                    width: "500px",
                                    marginTop: tierIndex === 0 ? "" : "0.5rem",
                                    border: "2px dotted gray",
                                  }}
                                  className="displayFlex "
                                >
                                  {tierSubnets.map((subnet) => (
                                    <SubnetBox
                                      subnet={subnet}
                                      vpc={vpc}
                                      key={vpc.name + subnet.name}
                                    >
                                      {craig.store.json.vsi.map(
                                        (vsi, vsiIndex) => {
                                          if (
                                            contains(
                                              vsi.subnets,
                                              subnet.name
                                            ) &&
                                            vsi.vpc === vpc.name
                                          ) {
                                            return buildNumberDropdownList(
                                              Number(vsi.vsi_per_subnet),
                                              0
                                            ).map((num) => {
                                              return (
                                                <DeploymentIcon
                                                  key={
                                                    subnet.name +
                                                    vpc.name +
                                                    num +
                                                    vsi.name
                                                  }
                                                  craig={craig}
                                                  itemName="vsi"
                                                  icon={BareMetalServer_02}
                                                  subnet={subnet}
                                                  vpc={vpc}
                                                  item={vsi}
                                                  index={num}
                                                  parentState={this.state}
                                                  vpcIndex={vpcIndex}
                                                  itemIndex={vsiIndex}
                                                  onClick={() => {
                                                    this.setSelection(
                                                      vpcIndex,
                                                      "vsi",
                                                      vsiIndex
                                                    );
                                                  }}
                                                  tabSelected={this.tabSelected}
                                                  onTabClick={this.onSgTabClick(
                                                    vpcIndex
                                                  )}
                                                />
                                              );
                                            });
                                          }
                                        }
                                      )}
                                      {craig.store.json.clusters.map(
                                        (cluster, clusterIndex) => {
                                          if (
                                            contains(
                                              cluster.subnets,
                                              subnet.name
                                            ) &&
                                            cluster.vpc === vpc.name
                                          ) {
                                            return buildNumberDropdownList(
                                              Number(
                                                cluster.workers_per_subnet
                                              ),
                                              0
                                            ).map((num) => {
                                              return (
                                                <DeploymentIcon
                                                  craig={craig}
                                                  itemName="clusters"
                                                  key={
                                                    subnet.name +
                                                    vpc.name +
                                                    num +
                                                    cluster.name
                                                  }
                                                  icon={
                                                    IbmCloudKubernetesService
                                                  }
                                                  subnet={subnet}
                                                  vpc={vpc}
                                                  item={cluster}
                                                  index={num}
                                                  parentState={this.state}
                                                  vpcIndex={vpcIndex}
                                                  itemIndex={clusterIndex}
                                                  onClick={() => {
                                                    this.setSelection(
                                                      vpcIndex,
                                                      "clusters",
                                                      clusterIndex
                                                    );
                                                  }}
                                                />
                                              );
                                            });
                                          }
                                        }
                                      )}
                                      {craig.store.json.virtual_private_endpoints.map(
                                        (vpe, vpeIndex) => {
                                          if (
                                            contains(
                                              vpe.subnets,
                                              subnet.name
                                            ) &&
                                            vpe.vpc === vpc.name
                                          ) {
                                            return (
                                              <DeploymentIcon
                                                craig={craig}
                                                itemName="virtual_private_endpoints"
                                                key={
                                                  subnet.name +
                                                  vpc.name +
                                                  vpe.name
                                                }
                                                icon={IbmCloudVpcEndpoints}
                                                subnet={subnet}
                                                vpc={vpc}
                                                item={vpe}
                                                index={vpeIndex}
                                                parentState={this.state}
                                                vpcIndex={vpcIndex}
                                                itemIndex={vpeIndex}
                                                onClick={() => {
                                                  this.setSelection(
                                                    vpcIndex,
                                                    "virtual_private_endpoints",
                                                    vpeIndex
                                                  );
                                                }}
                                                tabSelected={this.tabSelected}
                                                onTabClick={this.onSgTabClick(
                                                  vpcIndex
                                                )}
                                              />
                                            );
                                          }
                                        }
                                      )}
                                      {craig.store.json.vpn_gateways.map(
                                        (gw, gwIndex) => {
                                          if (gw.subnet === subnet.name) {
                                            return (
                                              <DeploymentIcon
                                                craig={craig}
                                                itemName="clusters"
                                                key={
                                                  subnet.name +
                                                  vpc.name +
                                                  gw.name
                                                }
                                                icon={GatewayVpn}
                                                subnet={subnet}
                                                vpc={vpc}
                                                item={gw}
                                                index={gwIndex}
                                                parentState={this.state}
                                                vpcIndex={vpcIndex}
                                                itemIndex={gwIndex}
                                                onClick={() => {
                                                  this.setSelection(
                                                    vpcIndex,
                                                    "vpn_gateways",
                                                    gwIndex
                                                  );
                                                }}
                                              />
                                            );
                                          }
                                        }
                                      )}
                                    </SubnetBox>
                                  ))}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div id="right-vpc-deployments">
                    {this.state.editing === true ? (
                      <div
                        style={{
                          width: "50vw",
                          padding: "0",
                          marginTop: "1rem",
                        }}
                      >
                        <CraigFormHeading
                          icon={RenderForm(
                            this.state.selectedItem === "vsi"
                              ? BareMetalServer_02
                              : this.state.selectedItem ===
                                "virtual_private_endpoints"
                              ? IbmCloudVpcEndpoints
                              : this.state.selectedItem === "vpn_gateways"
                              ? GatewayVpn
                              : this.state.selectedItem === "security_groups"
                              ? Security
                              : this.state.selectedItem === "ssh_keys"
                              ? Password
                              : IbmCloudKubernetesService,
                            {
                              style: {
                                marginRight: "0.5rem",
                                marginTop: "0.4rem",
                              },
                            }
                          )}
                          noMarginBottom
                          name={`Editing ${
                            this.state.selectedItem === "vsi"
                              ? "VSI"
                              : this.state.selectedItem ===
                                "virtual_private_endpoints"
                              ? "VPE"
                              : this.state.selectedItem === "vpn_gateways"
                              ? "VPN Gateway"
                              : this.state.selectedItem === "security_groups"
                              ? "Security Group"
                              : this.state.selectedItem === "ssh_keys"
                              ? "SSH Key"
                              : "Cluster"
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
                          hideHeading
                          name={
                            craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ].name
                          }
                          submissionFieldName={this.state.selectedItem}
                          innerFormProps={{
                            form: forms[this.state.selectedItem],
                            craig: craig,
                            data: craig.store.json[this.state.selectedItem][
                              this.state.selectedIndex
                            ],
                            // need to be passed to render child forms
                            disableSave: disableSave,
                            propsMatchState: propsMatchState,
                            vpc_name: this.vpcName(),
                          }}
                        />
                      </div>
                    ) : (
                      ""
                    )}
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
