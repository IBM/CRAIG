import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { FileStorage, Power } from "@carbon/icons-react";
import { IcseFormGroup } from "icse-react-assets";
import { DeploymentIcon } from "../diagrams";
import PropTypes from "prop-types";

export const PowerVolumes = (props) => {
  let craig = props.craig;
  let power = props.power;
  return (
    <div className="formInSubForm">
      <CraigFormHeading
        name="Storage Volumes"
        type="subHeading"
        icon={<FileStorage className="diagramTitleIcon" />}
      />
      <IcseFormGroup
        className="displayFlex alignItemsCenter overrideGap"
        style={{
          width: "535px",
        }}
      >
        {craig.store.json.power_volumes
          .filter((volume, volumeIndex) => {
            if (volume.workspace === power.name) {
              volume.index = volumeIndex;
              return volume;
            }
          })
          .map((volume) => (
            <div style={{ width: "140px" }} key={volume.name + power.name}>
              <DeploymentIcon
                icon={FileStorage}
                itemName="power_volumes"
                item={volume}
                index={volume.index}
                onClick={
                  props.onVolumeClick
                    ? () => {
                        props.onVolumeClick(volume.index);
                      }
                    : undefined
                }
                isSelected={props.isSelected}
              />
            </div>
          ))}
      </IcseFormGroup>
    </div>
  );
};

PowerVolumes.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  power: PropTypes.shape({}),
  onVolumeClick: PropTypes.func,
};
