function newDefaultKms() {
  return [
    {
      name: "kms",
      resource_group: "service-rg",
      use_hs_crypto: false,
      authorize_vpc_reader_role: true,
      use_data: false,
      keys: [
        {
          key_ring: "ring",
          name: "key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false
        },
        {
          key_ring: "ring",
          name: "atracker-key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false
        },
        {
          key_ring: "ring",
          name: "vsi-volume-key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false
        }
      ]
    }
  ];
}

/**
 * create new default cos object
 */
function newDefaultCos() {
  return [
    {
      buckets: [
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "atracker-bucket",
          storage_class: "standard"
        }
      ],
      keys: [
        {
          name: "cos-bind-key",
          role: "Writer",
          enable_HMAC: false
        }
      ],
      name: "atracker-cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      random_suffix: true,
      kms: "kms"
    },
    {
      buckets: [
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "key",
          name: "management-bucket",
          storage_class: "standard"
        },
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "key",
          name: "workload-bucket",
          storage_class: "standard"
        }
      ],
      random_suffix: true,
      keys: [],
      name: "cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      kms: "kms"
    }
  ];
}

module.exports = { newDefaultKms, newDefaultCos };
