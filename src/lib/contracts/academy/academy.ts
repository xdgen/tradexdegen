/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/xdegen_academy.json`.
 */
export type XdegenAcademy = {
  "address": "FZmWrz1rThQFg12HStZygrVgShFkKBfybPxyYhcmFCJ5",
  "metadata": {
    "name": "xdegenAcademy",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createAcademy",
      "discriminator": [
        127,
        252,
        219,
        146,
        125,
        167,
        145,
        154
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true
        },
        {
          "name": "academy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  97,
                  100,
                  101,
                  109,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "academyId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "academyId",
          "type": "string"
        },
        {
          "name": "data",
          "type": {
            "defined": {
              "name": "createAcademyData"
            }
          }
        }
      ]
    },
    {
      "name": "createStudent",
      "discriminator": [
        78,
        190,
        199,
        71,
        237,
        199,
        19,
        201
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true
        },
        {
          "name": "student",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  117,
                  100,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "twitterHandle",
          "type": "string"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeVault",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "academy",
      "discriminator": [
        110,
        0,
        104,
        223,
        115,
        197,
        131,
        156
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "student",
      "discriminator": [
        173,
        194,
        250,
        75,
        154,
        20,
        81,
        57
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Math Overflow"
    },
    {
      "code": 6001,
      "name": "invalidStartDate",
      "msg": "Invalid Start Date"
    },
    {
      "code": 6002,
      "name": "invalidEndDate",
      "msg": "Invalid End Date"
    },
    {
      "code": 6003,
      "name": "academyNotStarted",
      "msg": "Academy Not Started"
    },
    {
      "code": 6004,
      "name": "academyClosed",
      "msg": "Academy Closed"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6006,
      "name": "insufficientFunds",
      "msg": "Insufficient Funds"
    },
    {
      "code": 6007,
      "name": "stringTooLong",
      "msg": "String Too Long"
    }
  ],
  "types": [
    {
      "name": "academy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "banner",
            "type": "string"
          },
          {
            "name": "plan",
            "type": {
              "defined": {
                "name": "plan"
              }
            }
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "fee",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "tutors",
            "type": {
              "vec": {
                "defined": {
                  "name": "tutor"
                }
              }
            }
          },
          {
            "name": "totalStudents",
            "type": "u64"
          },
          {
            "name": "totalEnrollmentAmount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "feeVault",
            "type": "pubkey"
          },
          {
            "name": "totalAcademies",
            "type": "u64"
          },
          {
            "name": "totalStudents",
            "type": "u64"
          },
          {
            "name": "totalEnrollments",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "createAcademyData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "banner",
            "type": "string"
          },
          {
            "name": "plan",
            "type": {
              "defined": {
                "name": "plan"
              }
            }
          },
          {
            "name": "fee",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "tutors",
            "type": {
              "vec": {
                "defined": {
                  "name": "tutor"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "plan",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "free"
          },
          {
            "name": "paid"
          }
        ]
      }
    },
    {
      "name": "student",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "twitter",
            "type": "string"
          },
          {
            "name": "totalEnrolledAcademies",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tutor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "expertise",
            "type": "string"
          }
        ]
      }
    }
  ]
};
