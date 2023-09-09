import { Router } from "express";
import {
  fethProducts,
  updatePriceController,
} from "../controllers/products.controller";
import { multerMiddleware } from "../middlewares/multer.middleware";
import { productsNotFoundAndVerifyFields } from "../middlewares/productsNotFoundAndVerifyFields.middleware";

const ProductRoutes: Router = Router();

ProductRoutes.post(
  "",
  multerMiddleware,
  productsNotFoundAndVerifyFields,
  fethProducts
);

ProductRoutes.patch("", updatePriceController);

export default ProductRoutes;
