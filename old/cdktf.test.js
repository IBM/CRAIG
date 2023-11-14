const { assert } = require("chai");
const sinon = require("sinon");
const cdktf = require("../express-controllers/cdktf");
const res = require("../unit-tests/mocks/response.mock");
const craigCdktf = require("../unit-tests/data-files/craig-cdktf.json");
const fs = require("fs");
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process

function mockExec(data, spy) {
  this.data = data;
  this.spy = spy;
  this.promise = (command) => {
    this.spy(command);
    return new Promise((resolve, reject) => {
      resolve(this.data);
    });
  };
}

describe("cdktf api calls", () => {
  describe("convert", () => {
    let sinonExec = new sinon.spy();
    beforeEach(() => {
      sinonExec = new sinon.spy();
    });
    describe("execPromise", () => {
      it("should run exec with arbitrary text", () => {
        let api = new cdktf(sinonExec);
        api.execPromise("echo 'hi'");
        assert.isTrue(
          sinonExec.calledOnceWith("echo 'hi'"),
          "it should run command"
        );
      });
    });
    describe("convert", () => {
      beforeEach(() => {
        sinonExec = new sinon.spy();
      });
      it("should send stdout data on success", () => {
        let api = new cdktf(sinonExec);
        api.convert(
          {
            body: {
              data: {
                test: {
                  hello: {
                    hi: "there",
                  },
                },
              },
            },
            params: {
              language: "typescript",
            },
          },
          res
        );
        let expectedData = `echo 'data "test" "hello" {\n  hi = "there"\n}' | cdktf convert --language typescript`;
        assert.isTrue(
          sinonExec.calledOnceWith(expectedData),
          "it should call with expected data"
        );
      });
    });
    describe("convertPost", () => {
      it("should return cdktf data", () => {
        let api = new cdktf(exec);
        let actualData;
        return api
          .convertPost(
            {
              body: craigCdktf,
              params: {
                language: "typescript",
              },
            },
            {
              send: (data) => {
                actualData = data;
              },
            }
          )
          .then(() => {
            // commented out here until learning how to handle modules
            // assert.deepEqual(
            //   actualData,
            //   fs.readFileSync("./unit-tests/data-files/craig.cdktf.ts", "utf8"),
            //   "it should return data"
            // );
          });
      }).timeout(100000);
      it("should return cdktf data", () => {
        let callSpy = new sinon.spy();
        let mockPromise = new mockExec(
          {
            stderr: "err",
          },
          callSpy
        ).promise;
        let api = new cdktf(mockPromise);
        let actualData;
        let status;
        return api
          .convertPost(
            {
              body: craigCdktf,
              params: {
                language: "typescript",
              },
            },
            {
              status: function (code) {
                status = code;
                return {
                  send: function (data) {
                    actualData = data;
                  },
                };
              },
            }
          )
          .then(() => {
            assert.deepEqual(
              actualData,
              {
                error: "CDKTF Conversion error",
                data: {
                  stderr: "err",
                },
              },
              "it should return data"
            );
          });
      }).timeout(100000);
      it("should respond with an error when data unsupported format", () => {
        let api = new cdktf(exec);
        let actualData;
        let status;
        return api.convertPost(
          {
            body: craigCdktf,
            params: {
              language: "fff",
            },
          },
          {
            status: function (code) {
              status = code;
              return {
                send: function (data) {
                  actualData = data;
                  assert.deepEqual(
                    status,
                    400,
                    "it should send correct status"
                  );
                  assert.deepEqual(
                    actualData,
                    { error: "Unsupported language fff" },
                    "it should send correct error message"
                  );
                },
              };
            },
          }
        );
      });
    });
  });
});
