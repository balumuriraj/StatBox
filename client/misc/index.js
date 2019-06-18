
async function init() {
  var $ref = falcor.Model.ref;
var model = new falcor.Model({cache: {
  rolesById: {
    1: {
      category: "cast",
      celeb: {$type: "ref", value: ["celebsById", 23]}
    },
    2: {
      category: "crew",
      celeb: {$type: "ref", value: ["celebsById", 24]}
    }
  },
  celebsById: {
    23: {
      name: "celeb1",
      photo: "photo1.jpg"
    },
    24: {
      name: "celeb2",
      photo: "photo2.jpg"
    }
  },
  moviesById: {
    12: {
      title: "title1",
      // cast: [
      //   $ref(["rolesById"], 1),
      //   $ref(["rolesById"], 2),
      // ]
      cast: [
        {$type: "ref", value: ["rolesById", 1]},
        {$type: "ref", value: ["rolesById", 2]}
      ]
    },
    15: {
      title: "title2",
      cast: [
        {$type: "ref", value: ["rolesById", 1]}
      ]
    }
  },
  moviesSearches: {
    "date1=1533663509551&date2=1536255509551": [
      {$type: "ref", value: ["moviesById", 12]},
      {$type: "ref", value: ["moviesById", 15]}
    ],
    "date1=1536256623456&date2=1538848623456": [
      {$type: "ref", value: ["moviesById", 15]}
    ]
  },
  usersById: {
    34: {
      authId: "user1"
    },
    35: {
      authId: "user2"
    }
  },
}});

var baseUrl = "http://localhost:4000";
var model1 = new falcor.Model({
  source: new falcor.HttpDataSource(baseUrl + "/api/model.json", {
    // Options here
    // headers: {
    //     // Any headers here
    //     'Authorization': `bearer ' + token` // JWT
    // },
    withCredentials: false//, Cookies
    // crossDomain: true // CORSl
  })
});

// console.log(JSON.stringify(await model.get(["moviesById", 12, ["title", "cast"], [0,1], ["category", "celeb"], ["name", "photo"]]), null, 2));
// console.log(JSON.stringify(await model1.get(["moviesById", 12, ["title", "cast"], [0,1], ["category", "celeb"], ["name", "photo"]]), null, 2));

// console.log(JSON.stringify(await model.get(["moviesSearches", ["date1=1533663509551&date2=1536255509551", "date1=1536256623456&date2=1538848623456"], [0,1], ["title", "cast"], [0,1], ["category", "celeb"], ["name", "photo"]]), null, 2));
// console.log(JSON.stringify(await model1.get(["moviesSearches", ["date1=1533663509551&date2=1536255509551", "date1=1536256623456&date2=1538848623456"], [0,1], ["title", "cast"], [0,1], ["category", "celeb"], ["name", "photo"]]), null, 2));

console.log(JSON.stringify(await model.get(["usersById", 34, ["authId"]]), null, 2));
console.log(JSON.stringify(await model1.get(["usersById", 34, ["authId"]]), null, 2));
}

init();