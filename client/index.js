var baseUrl = "http://localhost:4000";

var model = new falcor.Model({
  source: new falcor.HttpDataSource(baseUrl + "/model.json", {
    // Options here
    // headers: {
    //     // Any headers here
    //     'Authorization': `bearer ' + token` // JWT
    // },
    withCredentials: false, // Cookies
    // crossDomain: true // CORS
  })
});

model.get(["moviesById", [4, 5],
    ["name", "year", "poster", "runtime", "rating"]
  ])
  .then(function (response) {
    console.log(response);
  });

model.get(["moviesByYear", [2017, 2016], "movies", "length"])
  .then(function (response) {
    console.log(response);
  });

var years = [2017, 2016, 2015];
model.get(["moviesByYear", years, "movies", {
      from: 0,
      to: 9
    },
    ["id", "name", "date", "poster", "runtime", "rating"]
  ])
  .then(function (response) {
    console.log(response);

    var yearsObj = response.json.moviesByYear;
    var ulYears = document.getElementById("years");
    var divMovies = document.getElementById("movies");

    for (var year of years) {
      var liYear = document.createElement("li");
      liYear.innerText = year;
      liYear.setAttribute("year", year);
      ulYears.appendChild(liYear);

      var ulBlock = document.createElement("ul");
      ulBlock.className = "section-images in-active";
      ulBlock.setAttribute("year", year);

      divMovies.appendChild(ulBlock);

      var movies = yearsObj[year].movies;

      for (var movieId in movies) {
        var movie = movies[movieId];

        if (movie) {
          var liMovie = document.createElement("li");
          var img = document.createElement("img");
          img.width = 180;
          img.height = 225;
          img.src = movie.poster || "http://placehold.it/175x225";

          (function (movieId) {
            liMovie.addEventListener("click", () => {
              location.href = "/apps/StatBox/client/movie.html?id=" + movieId;
            });
          })(movie.id);

          liMovie.appendChild(img);
          ulBlock.appendChild(liMovie);
        }
      }
    }

    ulYears.addEventListener("click", (evt) => {
      ulYears.childNodes.forEach(node => {
        node.className = "";
      });
      evt.target.className = "active";
      var year = evt.target.getAttribute("year");
      var divMovies = document.getElementById("movies");
      for (var node of divMovies.children) {
        if (year === node.getAttribute("year")) {
          node.className = "section-images";
        } else {
          node.className = "section-images in-active";
        }
      }

      evt.stopPropagation();
    });

    ulYears.firstChild.className = "active";
    var liMore = document.createElement("li");
    liMore.innerText = "more";
    ulYears.appendChild(liMore);

    divMovies.firstChild.className = "section-images";
  });

model.get(["moviesByYearMonth", [2017, 2016],
    [1, 2], "movies", "length"
  ])
  .then(function (response) {
    console.log(response);
  });

model.get(["moviesByYearMonth", [2017], {
      from: 1,
      to: 12
    }, "movies", {
      from: 0,
      to: 9
    },
    ["name", "year", "poster", "runtime", "rating"]
  ])
  .then(function (response) {
    console.log(response);
  });