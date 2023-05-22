import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { FormPage } from "../components";
import { state } from "../lib";

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
  render(
    <FormPage url="/form/resourceGroups" craig={craig} form="resourceGroups" />
  );
});

describe("resource groups", () => {
  test("it should be able to open service-rg dropdown", () => {
    const user = userEvent.setup();
    user.click(
      screen.getByRole("button", {
        name: "service-rg-open-close",
      })
    );
  });
  describe("create", () => {
    test("it should be able to create a new rg", async () => {
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", {
          name: "resource-groups-add",
        })
      );
      let nameInput = screen.getByRole("textbox", {
        name: /Name/i,
      });
      let submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled(); // invalid
      await user.type(nameInput, "test-rg");
      await user.click(submitButton);
      waitFor(() => {
        expect(screen.getByText("test-rg")).toBeInTheDocument();
      });
    });
  });
  describe("update", () => {
    test("it should be able to update service-rg name", async () => {
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", {
          name: "service-rg-open-close",
        })
      );
      let nameInput = screen.getByRole("textbox", { name: /Name/i });
      await user.clear(nameInput); // clear first
      await user.type(nameInput, "new-name");
      expect(
        screen.getByRole("button", { name: "service-rg-save" }) // save should be enabled
      ).toBeEnabled();
      await user.click(
        screen.getByRole("button", {
          name: "service-rg-save", // save
        })
      );
      waitFor(() => {
        expect(screen.getByText("new-name")).toBeInTheDocument(); // this is the new label
      });
    });
  });
  describe("delete", () => {
    test("it should be able to delete service-rg", async () => {
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", {
          name: "service-rg-open-close",
        })
      );
      await user.click(
        screen.getByRole("button", {
          name: /service\-rg\-delete/i,
        })
      );
      waitFor(() => {
        expect(screen.getByText("service-rg")).not.toBeInTheDocument();
      });
    });
  });
});
