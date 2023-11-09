module.exports = {
    accounts: [
      {
        id: "12345",
        name: "Alice",
        //email: "alice@email.com",
        //password: "asdf1234",
        token: "asdf1234",
        roles: ["csaf_consumer"],
        permissions: [
          {
            permission: "read",
            definition: "https://www.first.org/tlp/",
            tlpLabel: "RED"
          }, 
          {
            permission: "read",
            definition: "https://www.first.org/tlp/",
            tlpLabel: "GREEN"
          }, 
          {
            permission: "read",
            definition: "https://www.first.org/tlp/",
            tlpLabel: "WHITE"
          }
        ]
      },
      {
        id: "67890",
        name: "Bob",
        //email: "bob@email.com",
        //password: "pAsSWoRd!",
        token: "pAsSWoRd!",
        roles: ["csaf_aggregator"],
        permissions: [
          {
            permission: "read",
            definition: "https://www.first.org/tlp/",
            tlpLabel: "WHITE"
          }
        ]
      }
    ]
  };