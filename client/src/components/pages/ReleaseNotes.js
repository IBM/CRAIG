import { Accordion, AccordionItem } from "@carbon/react";
import "./releasenotes.scss";
import { RegexButWithWords } from "regex-but-with-words";
import { titleCase } from "lazy-z";

const { releaseNotes } = require("../../lib");
const replaceFirstBacktickExp = new RegexButWithWords()
  .literal("`")
  .look.ahead((exp) => {
    exp
      .negatedSet((exp) => exp.literal("`,").whitespace())
      .anyNumber()
      .literal("`");
  })
  .done("g");

const ReleaseNote = (props) => {
  return (
    <AccordionItem title={props.note.version} key={props.note.version}>
      <div>
        {
          // for each field
          ["upgrade_notes", "features", "fixes"].map((field) => {
            // if the field is part of the note object and there is at least one entry
            if (props.note[field] && props.note[field].length > 0)
              // render ist of items
              return (
                <>
                  <h5 className="marginBottomXs">{titleCase(field) + ":"}</h5>
                  <ul className="bullets indent marginBottomSmall">
                    {props.note[field].map((item, index) => (
                      <li
                        key={props.note.version + "-" + field + "-" + index}
                        dangerouslySetInnerHTML={{
                          // set inner HTML to have items in backticks (``) wrapped in the
                          // code tag to mimic markdown highlighting
                          __html: item
                            .replace(
                              replaceFirstBacktickExp,
                              '<code class="noRgService spanPadding">',
                            )
                            .replace(/`/g, "</code>"),
                        }}
                      />
                    ))}
                  </ul>
                </>
              );
          })
        }
      </div>
    </AccordionItem>
  );
};

const ReleaseNotes = () => {
  return (
    <div>
      <h1 className="marginBottomXs">Release Notes</h1>
      <Accordion align="start" size="lg">
        {releaseNotes.map((note) => (
          <ReleaseNote key={note.version} note={note} />
        ))}
      </Accordion>
    </div>
  );
};

export default ReleaseNotes;
