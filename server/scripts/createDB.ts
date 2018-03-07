import { JSDOM } from "jsdom";
import { CelebModel } from "../services/celeb/model";
import { CriticModel } from "../services/critic/model";
import { MovieModel } from "../services/movie/model";
import { ReviewModel } from "../services/review/model";

async function performScrapeRequest(url: string) {
  console.log(url);
  return await JSDOM.fromURL(url)
    .then((dom) => {
      const { document } = dom.window;
      return document;
    }, (err) => {
      return null;
    });
}


async function updateMovie(movie: IMovie) {
  const { url } = movie;
  const dom: any = await performScrapeRequest(url);
  const mainBlock = dom.getElementsByClassName("filmibeat-db-movierightcol")[0];
  const childBlocks = mainBlock.getElementsByClassName("ratings");
  const leftBlock = childBlocks[0];

  // Genre and Date
  const genreDateBlocks = leftBlock.getElementsByClassName("filmibeat-db-normaltext");
  if (genreDateBlocks[0]) {
    const genreList = genreDateBlocks[0].children;
    const genre: string[] = [];
    for (const genreElm of genreList) {
      genre.push(genreElm.children[0].innerHTML.trim());
    }
    movie.genre = genre;
  }

  if (genreDateBlocks[1]) {
    const durDom = genreDateBlocks[1].children[0];
    let duration: number = null;

    if (durDom) {
      const durStr = durDom.innerHTML;
      const durArr = durStr.trim().split(" ");

      if (durArr && durArr.length === 4) {
        const hrsStr = durArr[0];
        const minsStr = durArr[2];
        const hrs = hrsStr && Number(hrsStr) || 0;
        const mins = minsStr && Number(minsStr) || 0;
        duration = (hrs * 60) + mins;
      }
      else if (durArr && durArr.length === 3) {
        const minsStr = durArr[1];
        duration = minsStr && Number(minsStr) || 0;
      }
    }

    movie.runtime = duration;
  }

  const rightBlock = childBlocks[1];
  const dateBlock = rightBlock.getElementsByClassName("filmibeat-db-normaltext")[0] as any;
  movie.releasedate = new Date(dateBlock.innerHTML.trim());

  // Cast and Crew
  const castCrewLink = url.split(".html")[0] + "/cast-crew.html";
  const castCrewDOM: any = await performScrapeRequest(castCrewLink);

  const castList = castCrewDOM && castCrewDOM.getElementsByClassName("filmibeat-db-cast-content")[0].children[0].children;
  const cast: ICeleb[] = [];
  if (castList && castList.length) {
    for (const elem of castList) {
      const celebUrl = elem.children[0].href.trim();
      const castDOM: any = await performScrapeRequest(celebUrl);

      if (castDOM) {
        const celeb: ICeleb = {
          name: null,
          url: null,
          photo: null,
          dob: null
        };

        const imageUrl = castDOM.getElementsByClassName("filmibeat-db-celebprofilecol")[0].children[0].children[0].src;
        celeb.photo = imageUrl && imageUrl.indexOf("noimage") > -1 ? null : imageUrl;
        celeb.url = celebUrl;
        celeb.name = castDOM.getElementsByClassName("filmibeat-db-mainheading")[0].innerHTML.trim();

        const dobDOM = castDOM.getElementsByClassName("dbay-year-age")[0];
        const dobString = dobDOM && dobDOM.innerHTML.split("(")[0].trim();
        celeb.dob = dobString && new Date(dobString) || null;

        cast.push(celeb);
      }
    }
  }
  movie.cast = cast;

  const crewList = castCrewDOM && castCrewDOM.getElementsByClassName("fimlibeat-db-crew-details");
  const crew: any[] = [];
  if (crewList && crewList.length) {
    for (const elem of crewList) {
      const anchors = elem && elem.getElementsByTagName("a");
      if (anchors && anchors[0]) {
        const celebUrl = anchors[0].href.trim();
        const crewDOM: any = await performScrapeRequest(celebUrl);

        if (crewDOM) {
          const celeb: ICeleb = {
            name: null,
            url: null,
            photo: null,
            dob: null
          };

          const img = crewDOM.getElementsByClassName("filmibeat-db-celebprofilecol")[0].children[0].children[0].src;
          celeb.photo = img && img.indexOf("noimage") > -1 ? null : img;
          celeb.url = celebUrl;
          celeb.name = crewDOM.getElementsByClassName("filmibeat-db-mainheading")[0].innerHTML.trim();

          const dobDOM = crewDOM.getElementsByClassName("dbay-year-age")[0];
          const dobString = dobDOM && dobDOM.innerHTML.split("(")[0].trim();
          celeb.dob = dobString && new Date(dobString) || null;

          crew.push(celeb);
        }
      }
    }
  }
  movie.crew = crew;

  // Review
  const reviewUrl = url.split(".html")[0] + "/review.html";
  const reviewDOM: any = await performScrapeRequest(reviewUrl);
  const noReview = reviewDOM.getElementsByClassName("no-critics")[0];
  const reviews: any[] = [];
  if (!noReview) {
    const reviewList = reviewDOM.getElementsByClassName("popcorn-criticsReview");

    for (const elem of reviewList) {
      const review: IReview = {
        critic: null,
        url: null,
        rating: null
      };

      const titleBlock = elem.getElementsByClassName("criticsReviewTitle")[0].children[0];
      const anchor = titleBlock.getElementsByTagName("a")[0];

      if (anchor) {
        review.url = anchor.href.trim();
        review.critic = anchor.innerHTML.trim();
      }
      else {
        review.critic = titleBlock.innerHTML.trim();

        const linkBlock = elem.getElementsByClassName("criticsReviewLink")[0];
        if (linkBlock) {
          review.url = linkBlock.children[0].href.trim();
        }
      }

      const ratingBlock = elem.getElementsByClassName("starRating")[0];
      const ratingString = ratingBlock.getAttribute("class").split(" ")[1].split("-")[1];
      const rating = Number(ratingString);
      review.rating = ratingString.length > 1 ? (rating / 10) : rating;

      reviews.push(review);
    }
  }
  movie.reviews = reviews;
}

async function getMovies(dom: HTMLDocument) {
  const movies: IMovie[] = [];
  const moviesLists = [dom.getElementsByClassName("filmibeat-upcoming-movies-lists")[0]];

  for (const moviesList of moviesLists) {
    const list = moviesList.getElementsByTagName("li");

    for (const elem of list) {
      const movie: IMovie = {
        name: null,
        url: null,
        poster: null,
        runtime: null,
        releasedate: null,
        genre: [],
        cast: [],
        crew: [],
        reviews: []
      };

      const imgBlock = elem.children[0];
      const anchor = imgBlock && imgBlock.children[0] as any;

      movie.url = anchor && anchor.href.trim();
      movie.poster = anchor && anchor.children[0].src.trim();
      movie.name = anchor && anchor.children[0].title.trim();

      await updateMovie(movie);

      console.log(movie.name, movie.releasedate);

      movies.push(movie);
    }
  }

  return movies;
}

async function getDataFromScrapping() {
  const movies: any[] = [];
  const numYears = 1; //8
  const startYear = 2017;
  const endPoint = "https://www.filmibeat.com/telugu/movies/";

  const startTime = Date.now();

  for (let i = 0; i < numYears; i++) {
    const year = startYear - i;
    const url = endPoint + "january-" + year + ".html";

    const dom: any = await performScrapeRequest(url);
    const moviesData = await getMovies(dom);
    movies.push(...moviesData);
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000;
  console.log("data scrapping completed!! TimeTaken: ", timeTaken);

  return movies;
}

async function createCeleb(celebData: ICeleb, movieId: string) {
  const findResult = await CelebModel.find({ url: celebData.url });

  let celebId: string = null;

  if (!findResult.length) {
    celebId = await CelebModel.create({
      name: celebData.name,
      url: celebData.url,
      photo: celebData.photo,
      dob: celebData.dob
    });
  }
  else {
    celebId = findResult[0]._id;
  }

  // update celeb
  CelebModel.update(celebId, { $push: { movieIds: movieId } });

  return celebId;
}

async function createCritic(criticData: any, reviewId: string) {
  const findResult = await CriticModel.find({ name: criticData.name });

  let criticId: string = null;

  if (!findResult.length) {
    criticId = await CriticModel.create({
      name: criticData.name,
      url: criticData.url,
      image: criticData.image
    });
  }
  else {
    criticId = findResult[0]._id;
  }

  // update critic
  CriticModel.update(criticId, { $push: { reviewIds: reviewId } });

  return criticId;
}

async function createReview(reviewData: IReview, movieId: string) {
  const reviewId = await ReviewModel.create({
    url: reviewData.url,
    movieId,
    rating: reviewData.rating
  });

  const criticId = await createCritic({ name: reviewData.critic }, reviewId);

  // update review
  ReviewModel.update(reviewId, { criticId });

  return reviewId;
}

async function createDB() {
  const data: IMovie[] = await getDataFromScrapping();

  for (const movie of data) {
    const movieId = await MovieModel.create({
      name: movie.name,
      url: movie.url,
      poster: movie.poster,
      genre: movie.genre,
      runtime: movie.runtime,
      releasedate: movie.releasedate
    });

    const castCelebs = movie.cast;
    for (const celebData of castCelebs) {
      const celebId = await createCeleb(celebData, movieId);
      MovieModel.update(movieId, { $push: { castIds: celebId } });
    }

    const crewCelebs = movie.crew;
    for (const celebData of crewCelebs) {
      const celebId = await createCeleb(celebData, movieId);
      MovieModel.update(movieId, { $push: { crewIds: celebId } });
    }

    const reviewsData = movie.reviews;
    for (const reviewData of reviewsData) {
      const reviewId = await createReview(reviewData, movieId);
    }
  }
}

createDB();

interface IMovie {
  name: string;
  url: string;
  poster: string;
  runtime: number;
  releasedate: Date;
  genre: string[];
  cast: ICeleb[];
  crew: ICeleb[];
  reviews: IReview[];
}

interface ICeleb {
  name: string;
  url: string;
  photo: string;
  dob: Date;
}

interface IReview {
  critic: string;
  url: string;
  rating: number;
}
