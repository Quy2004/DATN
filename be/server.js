import express from "express";
import connectMongoDB from "./config/dbconfig.js";
import router from "./routes/index.js";

const dbUrl = "mongodb://127.0.0.1:27017/backend_nodejs";

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

// create db_nodejs in MongoDB

connectMongoDB(dbUrl);

app.use("/", router);

export const viteNodeApp = app;
