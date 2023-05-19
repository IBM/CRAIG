import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { Home } from "../components";
import { state } from "../lib";
import craigJSON from "../../../unit-tests/data-files/craig-json.json";
import slzJSON from "../../../unit-tests/data-files/slz-convert.json";

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}
// before each test, render the component we are testing
beforeEach(() => {
  let craig = newState();
  render(<Home url="/" craig={craig} />);
});

describe("options", () => {
  test("options save is disabled on page load", () => {
    expect(screen.getByRole("button", { name: "options-save" })).toBeDisabled();
  });
  test("options is savable after changes are made", async () => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Tags/i), "tag"); // set tags box to have a tag "tag"
    expect(screen.getByRole("button", { name: "options-save" })).toBeEnabled();
  });
});
describe("tabPanel", () => {
  describe("import json", () => {
    beforeEach(() => {
      fireEvent.click(screen.getByRole("tab", { name: /Import JSON/i })); // before each import json test, switch to the import json tab
    });
    test("loads and displays import JSON", async () => {
      await waitFor(() => {
        expect(
          screen.getByText(
            "Import existing CRAIG.json data for terraform deployment." // expect this text is on the page, it will be if we have switched tabs
          )
        ).toBeInTheDocument();
      });
    });
    test("json can be imported", async () => {
      // use fireEvent here due to how userEvent works with typing - can't have _ in json
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: JSON.stringify(craigJSON) }
      });
      expect(screen.getByRole("button", { name: "json-submit" })).toBeEnabled(); // after importing json, expect submit json button to be enabled
    });
  });
  describe("import slz json", () => {
    test("loads and displays import JSON", async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Import SLZ JSON/s })); // before each import json test, switch to the import json tab
      await waitFor(() => {
        expect(
          screen.getByText(
            "Import resource configuration from SLZ override.json file." // expect this text is on the page, it will be if we have switched tabs
          )
        ).toBeInTheDocument();
      });
    });
    test("override json should be disabled until prefix typed", async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Import SLZ JSON/i })); // before each import json test, switch to the import json tab
      expect(
        screen.getByRole("textbox", { name: "import-json" })
      ).toBeDisabled();
    });
    test("override json can be imported", async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Import SLZ JSON/i })); // before each import json test, switch to the import json tab
      const user = userEvent.setup();
      await user.type(
        screen.getByLabelText(/Secure Landing Zone Prefix/i),
        "slz"
      );
      // use fireEvent here due to how userEvent works with typing - can't have _ in json
      fireEvent.change(screen.getByRole("textbox", { name: "import-json" }), {
        target: { value: JSON.stringify(slzJSON) }
      });
      expect(screen.getByRole("button", { name: "json-submit" })).toBeEnabled(); // after importing json, expect submit json button to be enabled
    });
  });
});
describe("edge networking", () => {
  test("loads and displays edge networking form", async () => {
    const user = userEvent.setup();
    user.click(
      screen.getByRole("button", {
        name: "(optional)-transit-vpc-and-edge-networking-open-close"
      })
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "edge-networking-save"
        }) // save button will exist if toggleform opened correctly
      ).toBeInTheDocument();
    });
  });
  test("edge networking is savable when all fields are changed", async () => {
    const user = userEvent.setup();
    // open Edge Networking Form
    await user.click(
      screen.getByRole("button", {
        name: "(optional)-transit-vpc-and-edge-networking-open-close"
      })
    );
    // after form is opened, we expect save to be disabled
    expect(
      screen.getByRole("button", { name: "edge-networking-save" })
    ).toBeDisabled();
    await user.click(screen.getByLabelText(/Create a New Edge VPC/i)); // select edge
    await user.click(screen.getByLabelText(/Both VPN and WAF/i)); // select vpn-and-waf pattern
    await user.selectOptions(
      screen.getByLabelText(/Edge Networking Zones/i),
      "1"
    );
    expect(
      screen.getByRole("button", { name: "edge-networking-save" })
    ).toBeEnabled();
  });
});
test("code mirror does not display on the page", async () => {
  expect(document.getElementsByClassName("cm-line")).length === 0; // should be no instances of cm-line, which is every line of the code mirror
});
