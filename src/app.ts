import "express-async-errors";
import express, { Application, json } from "express";
import { handleErros } from "./error";
import cors from "cors";
import ProductRoute from "./routes/product.routes";

const app: Application = express();
app.use(json());
app.use(cors());
app.use("/editprice", ProductRoute);
app.use(handleErros);

export default app;
