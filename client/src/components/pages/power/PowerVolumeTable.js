import React from "react";
import {
  CraigFormHeading,
  DeleteModal,
  PrimaryButton,
  SecondaryButton,
} from "../../forms";
import { FileStorage } from "@carbon/icons-react";
import {
  Table,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
} from "@carbon/react";
import { contains, isNullOrEmptyString } from "lazy-z";
import { getVolumeDisplayName } from "../../../lib/forms/power-volume-table";

export class PowerVolumeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectedName: "",
      data: {},
    };
  }

  render() {
    let craig = this.props.craig;
    return this.props.parentState.selectedItem === "power_instances" ? (
      <>
        <DeleteModal
          name={this.state.data?.name || ""}
          modalOpen={this.state.showModal}
          onModalClose={() => {
            this.setState({ showModal: false, selectedName: "", data: {} });
          }}
          onModalSubmit={() => {
            this.props.craig.power_volumes.delete(
              {},
              {
                data: this.state.data,
                craig: this.props.craig,
              }
            );
            this.setState({ showModal: false, selectedName: "", data: {} });
          }}
        />
        <CraigFormHeading
          icon={<FileStorage className="diagramTitleIcon" />}
          name="Attached Volumes"
          type="subHeading"
          buttons={
            <PrimaryButton
              hoverText="Create a Volume"
              type="add"
              noDeleteButton
              onClick={this.props.onClick}
              className="marginRightThreeQuarterRem"
            />
          }
          className="marginBottomSmall"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Volume Name</TableHeader>
              <TableHeader>Storage Type</TableHeader>
              <TableHeader>Capacity</TableHeader>
              <TableHeader>Total Capacity</TableHeader>
              <TableHeader>Delete Volume</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {craig.store.json.power_volumes
              .filter((volume) => {
                if (
                  contains(
                    volume.attachments,
                    craig.store.json.power_instances[
                      this.props.parentState.selectedIndex
                    ].name
                  )
                ) {
                  return volume;
                }
              })
              .map((vol) => (
                <TableRow key={vol.name}>
                  <TableCell>
                    {vol.name}
                    {!isNullOrEmptyString(vol.count, true)
                      ? " (x" + vol.count + ")"
                      : ""}
                  </TableCell>
                  <TableCell>{getVolumeDisplayName(vol, craig)}</TableCell>
                  <TableCell>{vol.pi_volume_size}</TableCell>
                  <TableCell>
                    {isNullOrEmptyString(vol.count, true)
                      ? vol.pi_volume_size
                      : vol.count * vol.pi_volume_size}
                  </TableCell>
                  <TableCell>
                    <SecondaryButton
                      name={vol.name}
                      onClick={() => {
                        this.setState({ showModal: true, data: vol });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </>
    ) : (
      ""
    );
  }
}
