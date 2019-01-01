import * as md5 from "js-md5";
import { JSDOM } from "jsdom";
import { CelebModel } from "../services/celeb/model";
import { GenreModel } from "../services/genre/model";
import { MovieModel } from "../services/movie/model";
import { RoleModel } from "../services/role/model";

const numYears = 1; //8
const startYear = 2000;
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
// const months = ["november"];

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

  if (!mainBlock) {
    return;
  }

  const titleBlock = mainBlock.children[0];

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
  movie.releasedate = new Date(dateBlock.innerHTML.trim());

  // Cast and Crew
  const castCrewLink = url.split(".html")[0] + "/cast-crew.html";
  const castCrewDOM: any = await performScrapeRequest(castCrewLink);

  const castList = castCrewDOM && castCrewDOM.getElementsByClassName("filmibeat-db-cast-content")[0].children[0].children;
  const cast: ICeleb[] = [];
  if (castList && castList.length) {
    for (let index = 0; index < castList.length; index++) {
      const celebUrl = castList[index].children[0].href.trim();
      const castDOM: any = await performScrapeRequest(celebUrl);

      if (castDOM) {
        const celeb: ICeleb = {
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
        const celeb: ICeleb = {
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
  const moviesLists = dom.getElementsByClassName("filmibeat-upcoming-movies-lists");

  for (const moviesList of moviesLists) {
    const list = moviesList.getElementsByTagName("li");

    for (const elem of list) {
      const movie: IMovie = {
        name: null,
        // description: null,
        cert: null,
        url: null,
        poster: null,
        runtime: null,
        releasedate: null,
        genre: [],
        cast: [],
        crew: []
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

async function createCelebAndRole(celebData: ICeleb, movieId: number) {
  const hash = md5(celebData.url);
  const findResult = await CelebModel.find([{ hash }]);

  let celebId: number = null;

  if (!findResult.length) {
    celebId = await CelebModel.create({
      name: celebData.name,
      hash,
      photo: celebData.photo,
      dob: celebData.dob
    });
  }
  else {
    celebId = findResult[0]._id;
  }

  const roleId = await RoleModel.create({
    celebId, movieId,
    index: celebData.index,
    category: celebData.category,
    type: celebData.type
  });
}

async function createDB(data: IMovie[]) {
  for (const movie of data) {
    const movieId = await MovieModel.create({
      title: movie.name,
      // description: movie.description,
      cert: movie.cert,
      // url: movie.url,
      poster: movie.poster,
      genre: movie.genre,
      runtime: movie.runtime,
      releasedate: movie.releasedate
    });

    if (movie.genre) {
      for (const genre of movie.genre) {
        const findResult = await GenreModel.find({ name: genre });

        let genreId: number = null;

        if (!findResult.length) {
          genreId = await GenreModel.create({
            name: genre
          });
        }
        else {
          genreId = findResult[0]._id;
        }

        GenreModel.update(genreId, { $push: { movieIds: movieId } });
      }
    }

    const castCelebs = movie.cast;
    for (const celebData of castCelebs) {
      await createCelebAndRole(celebData, movieId);
    }

    const crewCelebs = movie.crew;
    for (const celebData of crewCelebs) {
      await createCelebAndRole(celebData, movieId);
    }
  }
}

async function initDB() {
  const endPoint = "https://www.filmibeat.com/telugu/movies/";
  const startTime = Date.now();

  for (let i = 0; i < numYears; i++) {
    const year = startYear - i;

    for (const month of months) {
      const url = `${endPoint}${month}-${year}.html`;
      const dom: any = await performScrapeRequest(url);
      const moviesData = await getMovies(dom);
      await createDB(moviesData);
    }
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000;
  console.log("database creation completed!! TimeTaken: ", timeTaken);
}

initDB();

interface IMovie {
  name: string;
  // description: string;
  url: string;
  poster: string;
  runtime: number;
  releasedate: Date;
  genre: string[];
  cast: ICeleb[];
  crew: ICeleb[];
  cert: string;
}

interface ICeleb {
  name: string;
  url: string;
  photo: string;
  dob: Date;
  index: number;
  category: string;
  type: string;
}
