import { CelebModel } from "../services/celeb/model";
import { FirebaseCounterModel } from "../services/firebaseCounter/model";
import { MovieModel } from "../services/movie/model";

const admin = require("firebase-admin");
const download = require("image-downloader");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "statbox89.appspot.com"
});

const bucket = admin.storage().bucket();

async function init() {
  const data = await FirebaseCounterModel.find();
  const firebaseCounter = data[0];
  const oldMoviesCount = firebaseCounter ? firebaseCounter.moviesCount : 0;
  const oldCelebsCount = firebaseCounter ? firebaseCounter.celebsCount : 0;

  const movieRecords = await MovieModel.find([], null, null, oldMoviesCount);
  const newMoviesCount = oldMoviesCount + movieRecords.length;

  const celebRecords = await CelebModel.find([], null, null, oldCelebsCount);
  const newCelebsCount = oldCelebsCount + celebRecords.length;

  for (const movie of movieRecords) {
    if (movie.poster) {
      const poster = `images/posters/${movie.id}.jpg`;

      try {
        const { filename, image } = await download.image({ url: movie.poster, dest: poster });
        const data = await bucket.upload(poster, { destination: poster });
        const file = data[0];
        const publicData = await file.makePublic();
        const url = `https://storage.googleapis.com/statbox89.appspot.com/${poster}`;
        console.log("url: ", url);
        await MovieModel.update(movie.id, { $set: { poster: url } });
      } catch (e) {
        console.error(e);
      }
    }
  }

  for (const record of celebRecords) {
    if (record.photo) {
      const photo = `images/photos/${record.id}.jpg`;
      const options = {
        url: record.photo,
        dest: photo
      };

      try {
        const { filename, image } = await download.image(options);
        const bucketOptions = { destination: photo };
        const data = await bucket.upload(photo, bucketOptions);
        const file = data[0];
        const publicData = await file.makePublic();
        const url = `https://storage.googleapis.com/statbox89.appspot.com/${photo}`;
        console.log("url: ", url);
        await CelebModel.update(record.id, { $set: { photo: url } });
      } catch (e) {
        console.error(e);
      }
    }
  }

  console.log("moviesCount: ", newMoviesCount, " celebsCount: ", newCelebsCount);

  if (!firebaseCounter) {
    await FirebaseCounterModel.create({ moviesCount: newMoviesCount, celebsCount: newCelebsCount });
  } else {
    await FirebaseCounterModel.update(firebaseCounter._id, { $set: { moviesCount: newMoviesCount, celebsCount: newCelebsCount } });
  }

  console.log("firebase storage push completed!");
}

init();
