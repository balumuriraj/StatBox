import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import * as falcorExpress from "falcor-express";
import * as helmet from "helmet";
import * as http from "http";
import falcorRouter from "./routes/falcorRouter";
import restRouter from "./routes/restRouter";

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
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use("/rest/api", restRouter);

    const dataSource = falcorExpress.dataSourceRoute((req, res) => falcorRouter);
    this.express.use("/model.json", dataSource);
  }

}

const app = new App().express;
const port = process.env.PORT || 3000;
app.set("port", port);

const server: http.Server = app.listen(app.get("port"), () => {
  console.log("app listening on port: ", port);
});

export { server };
