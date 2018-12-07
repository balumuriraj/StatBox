import * as mongoose from "mongoose";
import * as autoIncrement from "mongoose-auto-increment";
// import * as autoIncrement from "./autoincrement";

// const uri = "mongodb://localhost/statboxDB";
// const uri = "mongodb://localhost/tmdb";
const uri = "mongodb+srv://StatBox:Balumuri1989@statboxcluster-m0bwd.mongodb.net/test?retryWrites=true";
const options = { useNewUrlParser: true, dbName: "StatBoxDB" };
mongoose.connect(uri, options).then(() => { console.log("mongodb connection successful!"); }, (err) => { console.log(err); });
mongoose.set("useCreateIndex", true); // to remove deprecation errors
mongoose.set("useFindAndModify", false); // to remove deprecation errors
autoIncrement.initialize(mongoose.connection);

mongoose.set("debug", true);

export { autoIncrement, mongoose };
