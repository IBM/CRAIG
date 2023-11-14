## CRAIG

### Frontend Unit Testing

For testing of frontend components, we are using [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). This library focuses on testing how the software is used, rather than what is happening underneath each of the components. In short, the tests are written as if a user is using the site, and the goal is to ensure everything renders/functions as it should. What happens underneath in props and state is tested by our mocha unit tests, and is unknown to the user - so we're testing what the user could visually see with these tests.

To run all tests, 
```cd client && npm test```

#### Writing a Test
There are example tests written in `client/unit-tests/Home.test.js` and `client/unit-tests/ResourceGroups.test.js`, but the easiest to follow are in ResourceGroups. 

Before each test, make sure you virtually render the component you are testing:
```js
// before each test, render the component we are testing
beforeEach(() => {
  let craig = newState();
  render(
    <FormPage url="/form/resourceGroups" craig={craig} form="resourceGroups" />
  );
});
```

Then, write the test. The tests will always need a user object to be created first with `userEvent.setup()`, then write the test as if you are a user using that page - what should be enabled, what should be disabled, what should be accessible by the user when something is clicked (i.e., a chevron). You can get access to different buttons/inputs by querying their aria names, which are labeled via this schema:

**Add**: `Component-Name-add`

**Chevron**: `instance-name-open-close`

**Delete**: `instance-name-delete`

**Save**: `instance-name-save`

Or you can use the Testing Playground chrome extension for help writing queries.
```js
  describe("create", () => {
    test("it should be able to create a new rg", async () => {
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", {
          name: "resource-groups-add"
        })
      );
      let nameInput = screen.getByRole("textbox", {
        name: /Name/i
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
```
An important thing to note about these tests is that they are written asynchronously due to the way React State updates are async - each instruction should be awaited to make sure they are happening in order.

`waitFor` is a special async helper function that you can use in conjunction with an `expect` clause


#### Helpful Tools 

1. [Testing Playground Chrome Extension](https://chrome.google.com/webstore/detail/testing-playground/hejbmebodbijjdhflfknehhcgaklhano?hl=en) This chrome extension will allow you to select a component from the screen and it will show you the corresponding query you need to be able to access that component, which you can then copy/paste into code

2. `screen.debug()` - If your tests aren't working, you can put `screen.debug()` into your code and view the DOM to see if something that should have changed hasn't changed yet. Our DOMs are quite long in this project, so you may have to specify a new print length: `screen.debug(30000)`

3. Aria Roles you can query by: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques#roles