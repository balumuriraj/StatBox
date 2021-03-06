import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import * as falcorExpress from "falcor-express";
import * as helmet from "helmet";
import * as http from "http";
import FalcorRouter from "./routes/falcor/FalcorRouter";
import restRouter from "./routes/rest/router";
import tokenRouter from "./routes/token/router";

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  // Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(cookieParser());
    this.express.use(cors());
    this.express.use(helmet());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    // TODO: Add creds
    // this.express.use("/admin", express.static("client"));
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use("/api", tokenRouter);
    this.express.use("/api/rest", restRouter);

    const dataSource = falcorExpress.dataSourceRoute((req, res) => new FalcorRouter(req.body.userId));
    this.express.use("/api/model.json", dataSource);
  }

}

const app = new App().express;
const port = process.env.PORT || 3000;
app.set("port", port);

const server: http.Server = app.listen(app.get("port"), () => {
  console.log("app listening on port: ", port);
});

export { server };
