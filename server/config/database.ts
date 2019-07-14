import * as mongoose from "mongoose";

// Dev
// const uri = "mongodb://localhost/statbox";
// const options = { useNewUrlParser: true, dbName: "statbox" };

// Prod
const uri = "mongodb+srv://StatBox:Balumuri1989@statboxcluster-m0bwd.mongodb.net/test?retryWrites=true";
const options = { useNewUrlParser: true, dbName: "StatBoxDB" };

mongoose.connect(uri, options).then(() => { console.log("mongodb connection successful!"); }, (err) => { console.log(err); });
mongoose.set("useCreateIndex", true); // to remove deprecation errors
mongoose.set("useFindAndModify", false); // to remove deprecation errors

// mongoose.set("debug", true);

export {  mongoose };
