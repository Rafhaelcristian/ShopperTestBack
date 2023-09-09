import { Request, Response } from "express";
import { updatePriceService } from "../services/updatePrice.service";
import { fetchProductsService } from "../services/fetchProduct.service";

export const fethProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { csvData } = res.locals;

  const products = await fetchProductsService(csvData);

  return res.json(products);
};

export const updatePriceController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const products = await updatePriceService(req.body);

  return res.json(products);
};
