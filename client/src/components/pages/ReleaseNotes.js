import { Accordion, AccordionItem } from "@carbon/react";
import "./releasenotes.scss";

const { releaseNotes } = require("../../lib");

const ReleaseNote = props => {
  return (
    <AccordionItem title={props.note.version}>
      <div>
        {"features" in props.note && (
          <>
            <h5 className="marginBottomXs">Features:</h5>
            <ul className="bullets indent marginBottomSmall">
              {props.note.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </>
        )}
        {"fixes" in props.note && (
          <>
            <h5 className="marginBottomXs">Fixes:</h5>
            <ul className="bullets indent marginBottomSmall">
              {props.note.fixes.map((fix, index) => (
                <li key={index}>{fix}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AccordionItem>
  );
};

const ReleaseNotes = () => {
  return (
    <div>
      <h4>Release Notes</h4>
      <br />
      <Accordion align="start" size="lg">
        {releaseNotes.map(note => (
          <ReleaseNote key={note.version} note={note} />
        ))}
      </Accordion>
    </div>
  );
};

export default ReleaseNotes;
