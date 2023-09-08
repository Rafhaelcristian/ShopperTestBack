import { Request, Response } from "express";
import { updatePriceService } from "../services/patch.service";

export const updatePriceController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { csvData, productsWithErros } = res.locals;

  const products = await updatePriceService(csvData, productsWithErros);

  return res.json(products);
};
