import React from "react";
import { CraigFormHeading } from "../../forms/utils/ToggleFormComponents";
import { FileStorage } from "@carbon/icons-react";
import { DeploymentIcon } from "../diagrams";
import PropTypes from "prop-types";
import { CraigFormGroup } from "../../forms";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";

export const PowerVolumes = (props) => {
  let craig = props.craig;
  let power = props.power;
  return (
    <HoverClassNameWrapper
      className="formInSubForm"
      static={props.static}
      hoverClassName="diagramBoxSelected"
    >
      <CraigFormHeading
        name="Storage Volumes"
        type="subHeading"
        icon={<FileStorage className="diagramTitleIcon" />}
      />
      <CraigFormGroup className="displayFlex alignItemsCenter overrideGap">
        {craig.store.json.power_volumes
          .filter((volume, volumeIndex) => {
            if (volume.workspace === power.name) {
              volume.index = volumeIndex;
              return volume;
            }
          })
          .map((volume) => (
            <HoverClassNameWrapper
              className="width140"
              key={volume.name + power.name}
              static={props.static}
              hoverClassName="diagramIconBoxSelected"
            >
              <DeploymentIcon
                icon={FileStorage}
                itemName="power_volumes"
                item={volume}
                craig={craig}
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
            </HoverClassNameWrapper>
          ))}
      </CraigFormGroup>
    </HoverClassNameWrapper>
  );
};

PowerVolumes.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  power: PropTypes.shape({}),
  onVolumeClick: PropTypes.func,
};
