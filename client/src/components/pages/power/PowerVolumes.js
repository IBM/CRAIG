import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { FileStorage } from "@carbon/icons-react";
import { DeploymentIcon } from "../diagrams";
import PropTypes from "prop-types";
import { CraigFormGroup } from "../../forms";

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
      <CraigFormGroup className="displayFlex alignItemsCenter overrideGap width535">
        {craig.store.json.power_volumes
          .filter((volume, volumeIndex) => {
            if (volume.workspace === power.name) {
              volume.index = volumeIndex;
              return volume;
            }
          })
          .map((volume) => (
            <div className="width140" key={volume.name + power.name}>
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
      </CraigFormGroup>
    </div>
  );
};

PowerVolumes.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  power: PropTypes.shape({}),
  onVolumeClick: PropTypes.func,
};
