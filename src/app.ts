import "express-async-errors";
import express, { Application, json } from "express";
import { handleErros } from "./error";
import { updatePriceController } from "./controllers/products.controller";
import { productsNotFoundAndVerifyFields } from "./middlewares/productsNotFoundAndVerifyFields.middleware";
import cors from "cors";
import { multerMiddleware } from "./middlewares/multer.middleware";

const app: Application = express();
app.use(json());
app.use(cors());
app.use(
  "/editprice",
  multerMiddleware,
  productsNotFoundAndVerifyFields,
  updatePriceController
);
app.use(handleErros);

export default app;
