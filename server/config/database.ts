import * as mongoose from "mongoose";
import * as autoIncrement from "mongoose-auto-increment";

mongoose.connect("mongodb://localhost/statboxDB");
autoIncrement.initialize(mongoose.connection);

export { autoIncrement, mongoose };
