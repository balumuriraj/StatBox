import * as mongoose from "mongoose";
import * as autoIncrement from "mongoose-auto-increment";

mongoose.connect("mongodb://localhost/statbox");
autoIncrement.initialize(mongoose.connection);

export { autoIncrement, mongoose };
