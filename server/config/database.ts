import * as mongoose from "mongoose";
import * as autoIncrement from "mongoose-auto-increment";

mongoose.connect("mongodb://localhost/statboxDB", { useNewUrlParser: true } as any);
mongoose.set("useCreateIndex", true); // to remove deprecation errors
mongoose.set("useFindAndModify", false); // to remove deprecation errors
autoIncrement.initialize(mongoose.connection);

export { autoIncrement, mongoose };
