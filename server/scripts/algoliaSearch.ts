import algoliasearch = require("algoliasearch");
import { findAllCelebs } from "../services/celeb/service";
import { findAllMovies } from "../services/movie/service";

const client = algoliasearch("8P9LT48GR4", "c87e0ed7b9d9e6a37062c36f47fdf591");
const moviesIndex = client.initIndex("movies");
const celebsIndex = client.initIndex("celebs");

async function init() {
  const movieRecords = await findAllMovies();
  while (movieRecords.length) { moviesIndex.addObjects(movieRecords.splice(0, 10000)); }

  const celebRecords = await findAllCelebs();
  while (celebRecords.length) { celebsIndex.addObjects(celebRecords.splice(0, 10000)); }

  console.log("algoliasearch push completed!");
}

init();
