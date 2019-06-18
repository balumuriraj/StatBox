declare var Chartist: any;

const baseUrl = "http://localhost:4000";

const model = new falcor.Model({
  source: new falcor.HttpDataSource(baseUrl + "/model.json", {
    // Options here
    // headers: {
    //     // Any headers here
    //     'Authorization': `bearer ' + token` // JWT
    // },
    withCredentials: false//, Cookies
    // crossDomain: true // CORSl
  })
});

function generateCelebDOM(celeb: any, parent: HTMLElement) {
  if (celeb.name) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = celeb.photo || "http://placehold.it/175x225";
    card.appendChild(img);

    const block = document.createElement("div");
    card.appendChild(block);

    const name = document.createElement("p");
    name.innerText = celeb.name;
    name.className = "name";
    block.appendChild(name);

    const dob = document.createElement("p");
    dob.innerText = celeb.dob;
    dob.className = "dob";
    block.appendChild(dob);

    parent.appendChild(card);
  }
}

async function initPage() {
  const movieId = Number(location.search.split("=")[1]);

  const movie = await model.get(["moviesById", [movieId],
    ["title", "description", "date", "poster", "runtime", "genre", "cert"]
  ])
    .then((response) => {
      return response.json["moviesById"][movieId];
    });

  const background = document.getElementById("background");
  const backgroundImg = background.children[0] as any;
  backgroundImg.src = movie.poster;

  const poster = document.getElementById("poster");
  const posterImg = poster.children[0] as any;
  posterImg.src = movie.poster;
  posterImg.width = 220;
  posterImg.height = 275;

  poster.appendChild(posterImg);

  const title = document.getElementById("title");
  title.innerText = movie.title;

  console.log(movie);

  const genreList = document.getElementById("genreList");

  for (const genre of movie.genre) {
    const span = document.createElement("span");
    span.innerText = genre;
    genreList.appendChild(span);
  }

  const p = document.getElementById("dateTime");

  if (movie.cert) {
    const span = document.createElement("span");
    span.innerText = movie.cert;
    p.appendChild(span);
  }

  const span1 = document.createElement("span");
  span1.innerText = movie.date;
  p.appendChild(span1);

  const span2 = document.createElement("span");
  span2.innerText = movie.runtime + " mins";
  p.appendChild(span2);

  const description = document.getElementById("description");
  description.innerText = movie.description;

  // cast

  const castRoles = await model.get(["castByMovieId", [movieId],
    "roles", "length"
  ]).then((response) => {
    const rolesCount = response.json.castByMovieId[movieId].roles.length;

    return model.get(["castByMovieId", [movieId],
      "roles", { length: rolesCount },
      ["name", "photo", "dob"]
    ]);
  }).then((response) => {
    return response.json.castByMovieId[movieId].roles;
  });

  const cast = document.getElementById("cast");

  for (const index in castRoles) {
    const celeb = castRoles[index];
    generateCelebDOM(celeb, cast);
  }

  // crew

  const crewRoles = await model.get(["crewByMovieId", [movieId],
    "roles", "length"
  ]).then((response) => {
    const rolesCount = response.json.crewByMovieId[movieId].roles.length;

    return model.get(["crewByMovieId", [movieId],
      "roles", { length: rolesCount },
      ["name", "photo", "dob"]
    ]);
  }).then((response) => {
    return response.json.crewByMovieId[movieId].roles;
  });

  const crew = document.getElementById("crew");

  for (const index in crewRoles) {
    const celeb = crewRoles[index];
    generateCelebDOM(celeb, crew);
  }


  // stats

  const date = new Date(movie.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // const day = date.getDate();
  // const days = [ day - 1, day, day + 1];
  // console.log(days);

  const monthMovies = await model.get(["moviesByYearMonth", [year], [month], "movies", "length"])
    .then((response) => {
      const moviesCount = response.json.moviesByYearMonth[year][month].movies.length;
      console.log(moviesCount);

      return model.get(["moviesByYearMonth", [year], [month], "movies", { length: moviesCount }, ["title", "runtime", "rating"]]);
    }).then((response) => {
      console.log(response);
      return response.json.moviesByYearMonth[year][month].movies;
    });

  const labels: string[] = [];
  const runtimes: number[] = [];
  const ratings: number[] = [];


  for (const index in monthMovies) {
    const monthMovie = monthMovies[index];

    if (monthMovie.title) {
      labels.push(monthMovie.title);
      runtimes.push(monthMovie.runtime);
      ratings.push(Math.floor(Math.random() * 5) + 1);
    }
  }

  const options = {
    high: 5,
  low: 1,
    showArea: true,
    showLine: false,
    showPoint: false,
    fullWidth: true,
    axisY: {
      // showLabel: false,
      showGrid: false
    },
    axisX: {
      // showLabel: false,
      showGrid: false
    }
  };

  new Chartist.Line("#ratingsChart", { labels, series: [ratings] }, options);
  new Chartist.Line("#runtimesChart", { labels, series: [runtimes] }, options);

  // reviews

  const reviews = await model.get(["reviewsByMovieId", [movieId],
    "reviews", "length"
  ]).then((response) => {
    const reviewsCount = response.json.reviewsByMovieId[movieId].reviews.length;

    return model.get(["reviewsByMovieId", [movieId],
      "reviews", { length: reviewsCount },
      ["critic", "rating"]
    ]);
  }).then((response) => {
    return response.json.reviewsByMovieId[movieId].reviews;
  });

  const reviewlabels: string[] = [];
  const reviewRatings: number[] = [];

  for (const index in reviews) {
    const review = reviews[index];

    if (review && review.critic && review.rating) {
      reviewlabels.push(review.critic);
      reviewRatings.push(review.rating);
    }
  }

  console.log("avg", average(reviewRatings));
  console.log("median", median(reviewRatings));

  new Chartist.Line("#criticRatingsChart", { labels: reviewlabels, series: [reviewRatings] }, options);

  const reviewsDom = document.getElementById("reviews");

  for (const index in reviews) {
    const review = reviews[index];

    if (review && review.critic && review.rating) {
      const div = document.createElement("div");
      div.className = "card";

      const rating = document.createElement("p");
      rating.className = "rating";
      rating.innerHTML = review.rating;
      div.appendChild(rating);

      const text = document.createElement("p");
      text.className = "text";
      text.innerHTML = review.critic;
      div.appendChild(text);

      reviewsDom.appendChild(div);
    }
  }


  // menu
  const ulMenu = document.getElementById("nav");
  ulMenu.addEventListener("click", (evt: any) => {
    const statsParent = document.getElementById("stats").parentElement;
    const castParent = document.getElementById("cast").parentElement;
    const crewParent = document.getElementById("crew").parentElement;
    const reviewsParent = document.getElementById("reviews").parentElement;

    statsParent.className = "";
    castParent.className = "";
    crewParent.className = "";
    reviewsParent.className = "";

    for (const elm of ulMenu.children) {
      elm.className = "";
    }

    evt.target.className = "active";
    const item = evt.target.getAttribute("item");

    if (item === "stats") {
      statsParent.className = "active";
    }
    else if (item === "cast") {
      castParent.className = "active";
    }
    else if (item === "crew") {
      crewParent.className = "active";
    }
    else if (item === "reviews") {
      reviewsParent.className = "active";
    }

    evt.stopPropagation();
  });
}

function median(numbers) {
  // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
  let median = 0;
  const numsLen = numbers.length;

  numbers.sort();
  if (numsLen % 2 === 0) { // is even
    // average of two middle numbers
    median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
  } else { // is odd
    // middle number only
    median = numbers[(numsLen - 1) / 2];
  }
  return median;
}

function average(numbers) {
  // mean of [3, 5, 4, 4, 1, 1, 2, 3] is 2.875
  let total = 0;

  for (const number of numbers) {
    total += number;
  }
  return total / numbers.length;
}

initPage();
