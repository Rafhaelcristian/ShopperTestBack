import { Request, Response, NextFunction } from "express";
import csv from "csv-parser";
import { IProductsResponse } from "../interfaces/products.interface";
import connectToDatabase from "../database";
import { Readable } from "stream";

export const productsNotFoundAndVerifyFields = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
  }

  try {
    const { buffer } = req.file;

    var csvData: IProductsResponse[] = [];
    var productsWithErros: IProductsResponse[] = [];
    const requiredFields: string[] = ["product_code", "new_price"];
    var lineNumber = 0;

    const readableStream = Readable.from([buffer]);

    readableStream
      .pipe(csv())
      .on("data", (row) => {
        lineNumber++;

        const product: IProductsResponse = { ...row, lineNumber };

        for (const field of requiredFields) {
          if (!row[field] || row[field].trim() === "") {
            product.hasError = true;
            product.errorMessages = product.errorMessages || [];
            product.errorMessages.push(
              `O campo ${field} está ausente ou vazio na linha ${lineNumber}`
            );
          }
        }

        const numericValue = Number(row[requiredFields[1]]);

        if (isNaN(numericValue)) {
          product.hasError = true;
          product.errorMessages = product.errorMessages || [];
          product.errorMessages.push(
            `O campo ${requiredFields[1]} na linha ${lineNumber} não contém um valor numérico válido!`
          );
        }

        csvData.push(product);
      })
      .on("end", () => {
        const products = async (productCode: number) => {
          const connection = await connectToDatabase();
          try {
            const [rows, fields] = await connection.execute(
              "SELECT * FROM products WHERE code = ?",
              [productCode]
            );
            if (Array.isArray(rows) && rows.length === 0) {
              return null;
            }
            return rows;
          } catch (error) {
            console.error("Erro ao consultar banco de dados", error);
            return error;
          } finally {
            connection.end();
          }
        };

        const productCodes = csvData.map(async (product) => {
          const productsResult = await products(+product.product_code!);
          if (productsResult === null) {
            if (product.product_code) {
              product.hasError = true;
              product.errorMessages = product.errorMessages || [];
              product.errorMessages.push(
                `O produto com o código ${product.product_code} na linha ${product.lineNumber}, não foi encontrado `
              );
            }
          }

          return product;
        });

        Promise.all(productCodes).then((productsResults) => {
          productsWithErros.push(
            ...csvData.filter((product) => product.hasError)
          );
          const validProducts = csvData.filter((product, index) => {
            return productsResults[index] !== null && !product.hasError;
          });
          res.locals.csvData = validProducts;
          res.locals.productsWithErros = productsWithErros;

          next();
        });
      })
      .on("error", (error: any) => {
        console.error("Erro ao ler o arquivo CSV", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
      });
  } catch (error) {
    console.error("Erro ao processar o arquivo", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
