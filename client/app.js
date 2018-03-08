var baseUrl = "http://mbalumuri-mac.esri.com:4000";

var model = new falcor.Model({
  source: new falcor.HttpDataSource(baseUrl + "/model.json",  {
      // Options here
      // headers: {
      //     // Any headers here
      //     'Authorization': `bearer ' + token` // JWT
      // },
      withCredentials: false, // Cookies
      // crossDomain: true // CORS
  })
});

model.get(["moviesById", [4,5], ["name", "year", "poster", "runtime", "rating"]])
  .then(function (response) {
    console.log(response);
  });

model.get(["moviesByYear", [2017, 2016], "movies", "length"])
  .then(function (response) {
    console.log(response);
  });

model.get(["moviesByYear", [2017, 2016], "movies", { from: 0, to: 9 }, ["name", "year", "poster", "runtime", "rating"]])
.then(function (response) {
  console.log(response);
});

model.get(["moviesByYearMonth", [2017, 2016], [1, 2], "movies", "length"])
.then(function (response) {
  console.log(response);
});

model.get(["moviesByYearMonth", [2017], { from: 1, to: 12 }, "movies", { from: 0, to: 9 }, ["name", "year", "poster", "runtime", "rating"]])
.then(function (response) {
  console.log(response);
  var year = response.json.moviesByYearMonth["2017"]
  var ul = document.getElementById("movies");
  
  for (var month in year) {
    var movies = year[month].movies;

    for (var movieId in movies) {
      var movie = movies[movieId];

      var li = document.createElement("li");
      var img = document.createElement("img");
      img.width = 200;
      img.height = 275;
      img.src = movie.poster || "http://placehold.it/200x275";

      li.appendChild(img);
      ul.appendChild(li);
    }
  }

});