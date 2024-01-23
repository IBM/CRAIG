import React from "react";
import { CraigFormHeading, PrimaryButton } from "../../forms";
import { FileStorage } from "@carbon/icons-react";
import {
  Table,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
} from "@carbon/react";
import { contains, isNullOrEmptyString, revision, titleCase } from "lazy-z";

/**
 * get volume affinity name for display
 * @param {*} vol volume object
 * @returns {string} name to display
 */
function getAffinityName(vol, craig) {
  let isVolumeAffinity = isNullOrEmptyString(vol.pi_affinity_instance, true);
  let volumeAffinityData =
    vol[isVolumeAffinity ? "pi_affinity_volume" : "pi_affinity_instance"];
  let data = new revision(craig.store.json).child(
    isVolumeAffinity ? "power_volumes" : "power_instances",
    volumeAffinityData
  ).data;
  let titleName = titleCase(
    isVolumeAffinity && data.storage_option === "Storage Type"
      ? data.pi_volume_type
      : isVolumeAffinity
      ? data.pi_volume_pool
      : data.storage_option === "Storage Type"
      ? data.pi_storage_type
      : data.pi_storage_pool
  );
  return (
    titleName +
    ` (Affinity ${
      isVolumeAffinity ? "Volume" : "Instance"
    } ${volumeAffinityData})`
  );
}

/**
 * get volume affinity name for display
 * @param {*} vol volume object
 * @returns {string} name to display
 */
function getAntiAffinityName(vol, craig) {
  let isVolumeAffinity = isNullOrEmptyString(vol.pi_affinity_instance, true);
  let volumeAffinityData =
    vol[
      isVolumeAffinity ? "pi_anti_affinity_volume" : "pi_anti_affinity_instance"
    ];
  let data = new revision(craig.store.json).child(
    isVolumeAffinity ? "power_volumes" : "power_instances",
    volumeAffinityData
  ).data;
  let titleName = titleCase(
    isVolumeAffinity && data.storage_option === "Storage Type"
      ? data.pi_volume_type
      : isVolumeAffinity
      ? data.pi_volume_pool
      : data.storage_option === "Storage Type"
      ? data.pi_storage_type
      : data.pi_storage_pool
  );
  return `Anti-Affinity ${
    isVolumeAffinity ? "Volume" : "Instance"
  } ${volumeAffinityData} (${titleName})`;
}

export const PowerVolumeTable = (props) => {
  let craig = props.craig;
  return props.parentState.selectedItem === "power_instances" ? (
    <>
      <CraigFormHeading
        icon={<FileStorage className="diagramTitleIcon" />}
        name="Attached Volumes"
        type="subHeading"
        buttons={
          <PrimaryButton
            hoverText="Create a Volume"
            type="add"
            noDeleteButton
            onClick={props.onClick}
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
          </TableRow>
        </TableHead>
        <TableBody>
          {craig.store.json.power_volumes
            .filter((volume) => {
              if (
                contains(
                  volume.attachments,
                  craig.store.json.power_instances[
                    props.parentState.selectedIndex
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
                <TableCell>
                  {vol.storage_option === "Storage Type"
                    ? titleCase(vol.pi_volume_type)
                    : vol.storage_option === "Storage Pool"
                    ? titleCase(vol.pi_volume_pool)
                    : vol.storage_option === "Affinity"
                    ? getAffinityName(vol, craig)
                    : getAntiAffinityName(vol, craig)}
                </TableCell>
                <TableCell>{vol.pi_volume_size}</TableCell>
                <TableCell>
                  {isNullOrEmptyString(vol.count, true)
                    ? vol.pi_volume_size
                    : vol.count * vol.pi_volume_size}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  ) : (
    ""
  );
};
