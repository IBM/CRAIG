const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("object_storage", () => {
  describe("object_storage.init", () => {
    it("should initialize the object storage instances", () => {
      let state = new newState();
      let expectedData = [
        {
          buckets: [
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "atracker-key",
              name: "atracker-bucket",
              storage_class: "standard",
              use_random_suffix: true,
            },
          ],
          keys: [
            {
              name: "cos-bind-key",
              role: "Writer",
              enable_hmac: false,
              use_random_suffix: true,
            },
          ],
          name: "atracker-cos",
          plan: "standard",
          resource_group: "service-rg",
          use_data: false,
          use_random_suffix: true,
          kms: "kms",
        },
        {
          buckets: [
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "key",
              name: "management-bucket",
              storage_class: "standard",
              use_random_suffix: true,
            },
            {
              endpoint: "public",
              force_delete: true,
              kms_key: "key",
              name: "workload-bucket",
              storage_class: "standard",
              use_random_suffix: true,
            },
          ],
          use_random_suffix: true,
          keys: [],
          name: "cos",
          plan: "standard",
          resource_group: "service-rg",
          use_data: false,
          kms: "kms",
        },
      ];
      assert.deepEqual(
        state.store.json.object_storage,
        expectedData,
        "it should have cos"
      );
    });
  });
  describe("object_storage.create", () => {
    it("should create a new cos instance", () => {
      let state = new newState();
      state.object_storage.create({
        name: "todd",
        use_data: false,
        resource_group: "default",
        plan: "standard",
        use_random_suffix: true,
        kms: "kms",
      });
      let expectedData = {
        name: "todd",
        use_data: false,
        resource_group: null,
        plan: "standard",
        use_random_suffix: true,
        keys: [],
        buckets: [],
        kms: "kms",
      };
      assert.deepEqual(
        state.store.json.object_storage[2],
        expectedData,
        "it should create new cos"
      );
    });
  });
  describe("object_storage.save", () => {
    it("should update a cos instance in place", () => {
      let state = new newState();
      state.object_storage.save(
        { name: "cos", use_data: true },
        { data: { name: "atracker-cos" } }
      );
      assert.deepEqual(
        state.store.json.object_storage[0].use_data,
        true,
        "it should create new cos"
      );
    });
    it("should update a cos instance in place and update vpc and cluster cos names", () => {
      let state = new newState();
      state.object_storage.save({ name: "todd" }, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.object_storage[1].name,
        "todd",
        "it should create new cos"
      );
      assert.deepEqual(
        state.store.json.vpcs[0].cos,
        "todd",
        "it should update vpc cos name"
      );
      assert.deepEqual(
        state.store.json.clusters[0].cos,
        "todd",
        "it should update cluster cos name"
      );
    });
    it("should update a cos instance in place with same name", () => {
      let state = new newState();
      state.object_storage.save({ name: "cos" }, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.object_storage[1].name,
        "cos",
        "it should create new cos"
      );
    });
  });
  describe("object_storage.delete", () => {
    it("should delete a cos instance", () => {
      let state = new newState();
      state.object_storage.delete({}, { data: { name: "cos" } });
      assert.deepEqual(
        state.store.json.object_storage.length,
        1,
        "it should create new cos"
      );
    });
  });
  describe("object_storage.onStoreUpdate", () => {
    it("should create a list of storage buckets", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.cosBuckets,
        ["atracker-bucket", "management-bucket", "workload-bucket"],
        "it should have all the buckets"
      );
    });
    it("should create a list of storage keys", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.cosKeys,
        ["cos-bind-key"],
        "it should have all the keys"
      );
    });
    it("should remove unfound kms key from buckets after deletion", () => {
      let state = new newState();
      state.key_management.keys.delete(
        {},
        { arrayParentName: "kms", data: { name: "atracker-key" } }
      );
      state.update();
      assert.deepEqual(
        state.store.json.object_storage[0].buckets[0].kms_key,
        null,
        "it should have all the keys"
      );
    });
    it("should remove unfound kms instance from cos and buckets after deletion", () => {
      let state = new newState();
      state.key_management.delete({}, { data: { name: "kms" } });
      state.update();
      assert.deepEqual(
        state.store.json.object_storage[0].buckets[0].kms_key,
        null,
        "it should have all the keys"
      );
      assert.deepEqual(
        state.store.json.object_storage[0].kms,
        null,
        "it should have correct kms"
      );
    });
    it("should default cos plan to `standard` on update if none is specified", () => {
      let state = new newState();
      state.object_storage.create({
        name: "todd",
        use_data: false,
        resource_group: "default",
        plan: null,
        use_random_suffix: true,
        kms: "kms",
      });
      state.update();
      let expectedData = {
        name: "todd",
        use_data: false,
        resource_group: null,
        plan: "standard",
        use_random_suffix: true,
        keys: [],
        buckets: [],
        kms: "kms",
      };
      assert.deepEqual(
        state.store.json.object_storage[2],
        expectedData,
        "it should create new cos"
      );
    });
    it("should not automatically change existing cos plans to `standard` on update", () => {
      let state = new newState();
      state.object_storage.create({
        name: "todd",
        use_data: false,
        resource_group: "default",
        plan: "lite",
        use_random_suffix: true,
        kms: "kms",
      });
      state.update();
      let expectedData = {
        name: "todd",
        use_data: false,
        resource_group: null,
        plan: "lite",
        use_random_suffix: true,
        keys: [],
        buckets: [],
        kms: "kms",
      };
      assert.deepEqual(
        state.store.json.object_storage[2],
        expectedData,
        "it should create new cos"
      );
    });
  });
  describe("object_storage.schema", () => {
    describe("name helper text", () => {
      it("should return text if using data", () => {
        assert.deepEqual(
          newState().object_storage.name.helperText({
            use_data: true,
            name: "test",
          }),
          "test",
          "it should display data"
        );
      });
      it("should return text if not using data and with random suffix", () => {
        assert.deepEqual(
          newState().object_storage.name.helperText(
            { use_data: false, use_random_suffix: true, name: "test" },
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "test",
                    },
                  },
                },
              },
            }
          ),
          "test-test-<random-suffix>",
          "it should display data"
        );
      });
      it("should return text if not using data and without random suffix", () => {
        assert.deepEqual(
          newState().object_storage.name.helperText(
            { use_data: false, use_random_suffix: false, name: "test" },
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "test",
                    },
                  },
                },
              },
            }
          ),
          "test-test",
          "it should display data"
        );
      });
    });
    describe("kms", () => {
      it("should return kms groups", () => {
        assert.deepEqual(
          newState().object_storage.kms.groups({}, { craig: newState() }),
          ["kms", "NONE (Insecure)"],
          "it should return list of key protect instances"
        );
      });
      it("should be invalid when empty string", () => {
        assert.isTrue(
          newState().object_storage.kms.invalid({ kms: "" }),
          "it should not be valid"
        );
      });
      it("should return correct value on input change", () => {
        assert.deepEqual(
          newState().object_storage.kms.onInputChange({
            kms: "NONE (Insecure)",
          }),
          null,
          "it should return correct data"
        );
        assert.deepEqual(
          newState().object_storage.kms.onInputChange({ kms: "frog" }),
          "frog",
          "it should return correct data"
        );
      });
      it("should return correct value on render change", () => {
        assert.deepEqual(
          newState().object_storage.kms.onRender({
            kms: null,
          }),
          "NONE (Insecure)",
          "it should return correct data"
        );
        assert.deepEqual(
          newState().object_storage.kms.onRender({ kms: "frog" }),
          "frog",
          "it should return correct data"
        );
      });
      it("should return correct value on input change", () => {
        assert.deepEqual(
          newState().object_storage.buckets.kms_key.onInputChange({
            kms_key: "NONE (Insecure)",
          }),
          null,
          "it should return correct data"
        );
        assert.deepEqual(
          newState().object_storage.buckets.kms_key.onInputChange({
            kms_key: "frog",
          }),
          "frog",
          "it should return correct data"
        );
      });
    });
  });
  describe("object_storage.buckets", () => {
    describe("object_storage.buckets.create", () => {
      it("should create a bucket in a specified instance", () => {
        let state = new newState();

        state.object_storage.buckets.create(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
            showBucket: true,
          },
          {
            innerFormProps: { arrayParentName: "atracker-cos" },
            arrayData: state.store.json.object_storage[0].buckets,
          }
        );
        let expectedData = {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "todd",
          storage_class: "standard",
          use_random_suffix: true,
        };
        assert.deepEqual(
          state.store.json.object_storage[0].buckets[1],
          expectedData,
          "it should make new bucket"
        );
      });
    });

    describe("object_storage.buckets.save", () => {
      it("should update a bucket in a specified instance", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.object_storage.buckets.save(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
          },
          {
            arrayParentName: "cos",
            data: { name: "management-bucket" },
          }
        );
        let expectedData = {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "todd",
          storage_class: "standard",
          use_random_suffix: true,
        };
        assert.deepEqual(
          state.store.json.object_storage[1].buckets[0],
          expectedData,
          "it should make new bucket"
        );
      });
      it("should update a atracker collector bucket name when bucket changed", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.object_storage.buckets.save(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "todd",
            storage_class: "standard",
          },
          {
            arrayParentName: "atracker-cos",
            data: { name: "atracker-bucket" },
          }
        );
        assert.deepEqual(
          state.store.json.atracker.collector_bucket_name,
          "todd",
          "it should be todd"
        );
      });
      it("should update a bucket in a specified instance with same name", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-key",
        };
        state.object_storage.buckets.save(
          {
            endpoint: "public",
            force_delete: true,
            kms_key: "atracker-key",
            name: "management-bucket",
            storage_class: "standard",
          },
          {
            arrayParentName: "cos",
            data: { name: "management-bucket" },
          }
        );
        let expectedData = {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "management-bucket",
          storage_class: "standard",
          use_random_suffix: true,
        };
        assert.deepEqual(
          state.store.json.object_storage[1].buckets[0],
          expectedData,
          "it should make new bucket"
        );
      });
    });
    describe("object_storage.buckets.delete", () => {
      it("should delete bucket", () => {
        let state = new newState();
        state.object_storage.buckets.delete(
          {},
          { arrayParentName: "cos", data: { name: "management-bucket" } }
        );
        assert.deepEqual(
          state.store.json.object_storage[1].buckets.length,
          1,
          "should delete bucket"
        );
      });
    });
    describe("object_storage.buckets.schema", () => {
      let craig;
      beforeEach(() => {
        craig = newState();
        craig.store.json = {
          object_storage: [
            { name: "cosName1", kms: "kms1" },
            { name: "cosName2", kms: null },
          ],
          key_management: [
            {
              name: "kms1",
              keys: [
                { name: "key1", root_key: true },
                { name: "key2", root_key: false },
              ],
            },
            {
              name: "kms2",
              keys: [{ name: "key3", root_key: false }],
            },
          ],
        };
      });
      it("should return an empty array if kms is falsy", () => {
        const componentProps = {
          isModal: false,
          arrayParentName: "cosName2",
          craig: craig,
        };
        const result = craig.object_storage.buckets.kms_key.groups(
          {},
          componentProps
        );
        assert.deepEqual(result, ["NONE (Insecure)"]);
      });

      it("should return an array of key names for root keys when kms is selected", () => {
        const componentProps = {
          isModal: true,
          arrayParentName: "cosName1",
          craig: craig,
        };
        const result = craig.object_storage.buckets.kms_key.groups(
          {},
          componentProps
        );

        assert.deepEqual(result, ["key1", "NONE (Insecure)"]);
      });
    });
  });
  describe("object_storage.keys", () => {
    describe("object_storage.keys.create", () => {
      it("should create a new cos key in a specified instance", () => {
        let state = new newState();
        state.object_storage.keys.create(
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
          },
          {
            innerFormProps: { arrayParentName: "cos" },
            arrayData: state.store.json.object_storage[1].keys,
          }
        );
        assert.deepEqual(state.store.json.object_storage[1].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
      });
    });

    describe("object_storage.keys.save", () => {
      it("should update a cos key in a specified instance", () => {
        let state = new newState();
        state.store.json.atracker = {
          collector_bucket_name: "atracker-bucket",
        };
        state.store.json.atracker.cos_key = "cos-bind-key";
        state.object_storage.keys.save(
          { name: "todd" },
          { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
        );
        assert.deepEqual(state.store.json.object_storage[0].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
        assert.deepEqual(
          state.store.json.atracker.cos_key,
          "todd",
          "it should be todd"
        );
      });
      it("should update a cos key not atracker", () => {
        let state = new newState();

        state.object_storage.keys.create(
          {
            name: "boo",
            role: "Writer",
            enable_hmac: false,
          },
          {
            innerFormProps: { arrayParentName: "cos" },
            arrayData: state.store.json.object_storage[1].keys,
          }
        );
        state.object_storage.keys.save(
          { name: "todd" },
          { data: { name: "boo" }, arrayParentName: "cos" }
        );
        assert.deepEqual(state.store.json.object_storage[1].keys, [
          {
            name: "todd",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
      });
      it("should update cos key in a specified instance with same name", () => {
        let state = new newState();

        state.object_storage.keys.save(
          {
            name: "cos-bind-key",
          },
          { data: { name: "cos-bind-key" }, arrayParentName: "atracker-cos" }
        );
        assert.deepEqual(state.store.json.object_storage[0].keys, [
          {
            name: "cos-bind-key",
            role: "Writer",
            enable_hmac: false,
            use_random_suffix: true,
          },
        ]);
      });
    });
    describe("object_storage.keys.delete", () => {
      it("should delete a cos key in a specified instance", () => {
        let state = new newState();
        state.object_storage.keys.delete(
          {},
          { arrayParentName: "atracker-cos", data: { name: "cos-bind-key" } }
        );
        assert.deepEqual(state.store.json.object_storage[0].keys, []);
      });
    });
    describe("bucket shcema", () => {
      it("should return correct values on render", () => {
        let state = new newState();
        assert.deepEqual(
          state.object_storage.buckets.kms_key.onRender({ kms_key: null }),
          "NONE (Insecure)",
          "it should return correct value"
        );
        assert.deepEqual(
          state.object_storage.buckets.kms_key.onRender({ kms_key: "toad" }),
          "toad",
          "it should return correct value"
        );
      });
    });
  });
  describe("object_storage.shouldDisableSave", () => {
    const craig = newState();
    it("should return true if a object storage instance has an invalid name", () => {
      assert.isTrue(
        craig.object_storage.shouldDisableSave(
          { name: "@@@", use_data: false },
          {
            craig: {
              store: {
                json: {
                  object_storage: [
                    {
                      name: "frog",
                    },
                  ],
                },
              },
            },
            data: {
              name: "test",
            },
          }
        ),
        "it should be false"
      );
    });
    it("should return true if a object storage instance has an invalid resource group", () => {
      assert.isTrue(
        craig.object_storage.shouldDisableSave(
          { name: "aaa", use_data: false, resource_group: null },
          {
            craig: {
              store: {
                json: {
                  object_storage: [
                    {
                      name: "frog",
                      resource_group: null,
                    },
                  ],
                },
              },
            },
            data: {
              name: "test",
            },
          }
        ),
        "it should be false"
      );
    });
    // commented out for power poc
    // it("should return true if a object storage instance has an invalid kms instance", () => {
    //   assert.isTrue(
    //     craig.object_storage.shouldDisableSave(
    //       {
    //         name: "aaa",
    //         use_data: false,
    //         resource_group: "management-rg",
    //         kms: null,
    //       },
    //       {
    //         craig: {
    //           store: {
    //             json: {
    //               object_storage: [
    //                 {
    //                   name: "frog",
    //                   resource_group: null,
    //                 },
    //               ],
    //             },
    //           },
    //         },
    //         data: {
    //           name: "test",
    //         },
    //       }
    //     ),
    //     "it should be false"
    //   );
    // });
  });
  describe("object_storage.buckets.shouldDisableSave", () => {
    const craig = newState();
    it("should return true if an object storage bucket has an invalid name", () => {
      assert.isTrue(
        craig.object_storage.buckets.shouldDisableSave(
          { name: "@@@", use_data: false },
          {
            craig: {
              store: {
                json: {
                  object_storage: [
                    {
                      name: "frog",
                      buckets: [
                        {
                          name: "test",
                        },
                      ],
                    },
                  ],
                },
              },
            },
            data: {
              name: "test",
            },
          }
        ),
        "it should be false"
      );
    });
    // commented out to allow for unencrypted cos buckets
    // it("should return true if an object storage bucket has an invalid encryption key name", () => {
    //   assert.isTrue(
    //     craig.object_storage.buckets.shouldDisableSave(
    //       { name: "key", kms_key: null, use_data: false },
    //       {
    //         craig: {
    //           store: {
    //             json: {
    //               object_storage: [
    //                 {
    //                   name: "frog",
    //                   buckets: [
    //                     {
    //                       name: "test",
    //                     },
    //                   ],
    //                 },
    //               ],
    //             },
    //           },
    //         },
    //         data: {
    //           name: "test",
    //         },
    //       }
    //     ),
    //     "it should be false"
    //   );
    // });
  });
  describe("object_storage.keys.shouldDisableSave", () => {
    const craig = newState();
    it("should return true if an object storage key has an invalid name", () => {
      assert.isTrue(
        craig.object_storage.keys.shouldDisableSave(
          { name: "@@@", use_data: false },
          {
            craig: {
              store: {
                json: {
                  object_storage: [
                    {
                      name: "frog",
                      keys: [
                        {
                          name: "test",
                        },
                      ],
                    },
                  ],
                },
              },
            },
            data: {
              name: "test",
            },
          }
        ),
        "it should be false"
      );
    });
  });
});
