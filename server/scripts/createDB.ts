import * as md5 from "js-md5";
import { JSDOM } from "jsdom";
import { createCeleb, findCelebsByQuery } from "../services/celeb/service";
import { createGenre, findGenresByQuery, updateGenre } from "../services/genre/service";
import { createMeta } from "../services/meta/service";
import { createMovie, findMoviesByQuery } from "../services/movie/service";
import { createRole, findRolesByQuery } from "../services/role/service";

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

  const posterBlock = dom.getElementsByClassName("filmibeat-db-movieleftcol")[0];
  const imgElm = posterBlock.getElementsByTagName("img")[0];
  const poster = imgElm.src;
  movie.poster = poster && poster.indexOf("noimage") === -1 ? poster : null;

  const mainBlock = dom.getElementsByClassName("filmibeat-db-movierightcol")[0];

  if (!mainBlock) {
    return;
  }

  const titleBlock = mainBlock.getElementsByClassName("filmibeat-db-headwrapper")[0];
  const titleElm = titleBlock.getElementsByClassName("filmibeat-db-mainheading")[0];
  movie.name = titleElm.textContent.trim();

  if (titleBlock && titleBlock.children.length === 3) {
    let cert = titleBlock.children[1].textContent;
    cert = cert.replace("(", "");
    cert = cert.replace(")", "");

    movie.cert = cert.trim();
  }

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
  movie.releaseDate = new Date(dateBlock.innerHTML.trim());

  // Cast and Crew
  const castCrewLink = url.split(".html")[0] + "/cast-crew.html";
  const castCrewDOM: any = await performScrapeRequest(castCrewLink);

  const castList = castCrewDOM && castCrewDOM.getElementsByClassName("filmibeat-db-cast-content")[0].children[0].children;
  const cast: IRole[] = [];
  if (castList && castList.length) {
    for (let index = 0; index < castList.length; index++) {
      const celebUrl = castList[index].children[0].href.trim();
      const castDOM: any = await performScrapeRequest(celebUrl);

      if (castDOM) {
        const celeb: IRole = {
          name: null,
          url: null,
          photo: null,
          dob: null,
          index,
          type: "Actor",
          category: "cast"
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

  const crewList = castCrewDOM && castCrewDOM.getElementsByClassName("filmibeat-db-cast-content")[1].children[0].children;
  const crew: any[] = [];
  if (crewList && crewList.length) {
    for (let index = 0; index < crewList.length; index++) {
      const anchor = crewList[index].children[0];
      const celebUrl = anchor.href.trim();
      const crewDOM: any = await performScrapeRequest(celebUrl);

      const typeElm = anchor.children[1].children[1];
      const type = typeElm && typeElm.textContent.trim();

      if (crewDOM) {
        const celeb: IRole = {
          name: null,
          url: null,
          photo: null,
          dob: null,
          index,
          type,
          category: "crew"
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
  movie.crew = crew;
}

async function getMovies(dom: HTMLDocument) {
  const movies: IMovie[] = [];
  const moviesLists = dom.getElementsByClassName("movies-list");

  for (const moviesList of moviesLists) {
    const list = moviesList.getElementsByClassName("movie-img-block");

    for (const elem of list) {
      const movie: IMovie = {
        name: null,
        description: null,
        cert: null,
        url: null,
        poster: null,
        runtime: null,
        releaseDate: null,
        genre: [],
        cast: [],
        crew: []
      };

      const anchor = elem && elem.children[0] as any;
      movie.url = anchor && anchor.href.trim();

      // const poster = anchor && anchor.children[0].src.trim();
      // movie.poster = poster && poster.indexOf("noimage") === -1 ? poster : null;
      // movie.name = anchor && anchor.children[0].title.trim();

      await updateMovie(movie);

      console.log(movie.name, movie.releaseDate);

      movies.push(movie);
    }
  }

  return movies;
}

async function createCelebAndRole(roleData: IRole, movieId: number) {
  const hash = md5(roleData.url);
  const findResult = await findCelebsByQuery({ hash });
  let celebId: number = null;

  const celebData = {
    name: roleData.name,
    hash,
    photo: roleData.photo,
    dob: roleData.dob
  };

  if (!findResult.length) {
    const celeb = await createCeleb(celebData);
    celebId = celeb.id;
  }
  else {
    celebId = findResult[0].id;
    // await CelebModel.update(celebId, celebData);
  }

  const data = {
    celebId, movieId,
    index: roleData.index,
    category: roleData.category,
    type: roleData.type
  };
  const findRole = await findRolesByQuery(data);

  if (!findRole.length) {
    await createRole(data);
  }

  return celebId;
}

async function createDBForMovie(movie: IMovie, movieIds: number[], celebIds: number[]) {
  const hash = md5(movie.url);
  const movieData = {
    title: movie.name,
    cert: movie.cert,
    poster: movie.poster,
    genre: movie.genre,
    runtime: movie.runtime,
    releaseDate: movie.releaseDate,
    hash
  };
  const findResult = await findMoviesByQuery({ hash });
  let movieId: number = null;

  if (!findResult.length) {
    const movie = await createMovie(movieData);
    movieId = movie.id;
  }
  else {
    movieId = findResult[0].id;
    // await MovieModel.update(movieId, movieData);
  }

  movieIds.push(movieId);

  if (movie.genre) {
    for (const genre of movie.genre) {
      const findResult = await findGenresByQuery({ name: genre });

      let genreId: number = null;

      if (!findResult.length) {
        const gen = await createGenre({ name: genre });
        genreId = gen.id;
      }
      else {
        genreId = findResult[0].id;
      }

      await updateGenre(genreId, { $addToSet: { movieIds: movieId } });
    }
  }

  const castRoles = movie.cast;
  for (const roleData of castRoles) {
    const celebId = await createCelebAndRole(roleData, movieId);
    celebIds.push(celebId);
  }

  const crewRoles = movie.crew;
  for (const roleData of crewRoles) {
    const celebId = await createCelebAndRole(roleData, movieId);
    celebIds.push(celebId);
  }
}

async function createDB(data: IMovie[]) {
  const movieIds: number[] = [];
  const celebIds: number[] = [];

  for (const movie of data) {
    await createDBForMovie(movie, movieIds, celebIds);
  }

  return { movieIds, celebIds };
}

export async function createMovieFromUrl(url: string) {
  const startTime = Date.now();

  console.log("createMovieFromUrl started at", new Date(startTime).toLocaleString());

  const movie: IMovie = {
    name: null,
    description: null,
    cert: null,
    url,
    poster: null,
    runtime: null,
    releaseDate: null,
    genre: [],
    cast: [],
    crew: []
  };

  await updateMovie(movie);

  console.log(movie.name, movie.releaseDate);

  const movieIds: number[] = [];
  const celebIds: number[] = [];
  await createDBForMovie(movie, movieIds, celebIds);

  const data = {
    movieIds: [...new Set(movieIds)],
    celebIds: [...new Set(celebIds)],
    years: null,
    months: null,
    type: "add"
  };

  await createMeta(data);

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`createMovieFromUrl completed!! TimeTaken: ${timeTaken} Mins`);
}

export async function createDatabase(years: number[], months: string[]) {
  const endPoint = "https://www.filmibeat.com/telugu/movies/";
  const startTime = Date.now();
  const movieIds: number[] = [];
  const celebIds: number[] = [];

  console.log("createDatabase started at", new Date(startTime).toLocaleString());

  for (const year of years) {
    for (const month of months) {
      const url = `${endPoint}${month}-${year}.html`;
      const dom: any = await performScrapeRequest(url);
      const moviesData = await getMovies(dom);
      console.log("creating DB...");

      const res = await createDB(moviesData);
      movieIds.push(...res.movieIds);
      celebIds.push(...res.celebIds);
    }
  }

  const data = {
    movieIds: [...new Set(movieIds)],
    celebIds: [...new Set(celebIds)],
    years,
    months,
    type: "add"
  };

  await createMeta(data);

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 60000;
  console.log(`createDatabase completed!! TimeTaken: ${timeTaken} Mins`);
}

interface IMovie {
  name: string;
  description: string;
  url: string;
  poster: string;
  runtime: number;
  releaseDate: Date;
  genre: string[];
  cast: IRole[];
  crew: IRole[];
  cert: string;
}

interface IRole {
  name: string;
  url: string;
  photo: string;
  dob: Date;
  index: number;
  category: string;
  type: string;
}
