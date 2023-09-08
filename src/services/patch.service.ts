import "dotenv/config";
import connectToDatabase from "../database";
import {
  IPackProducts,
  IProductRequest,
  IProducts,
  IProductsResponse,
} from "../interfaces/products.interface";
import { RowDataPacket } from "mysql2";

export const updatePriceService = async (
  payload: IProductRequest[],
  productsWithErros: IProductsResponse[]
) => {
  const productsResponse: IProductsResponse[] = [];
  productsResponse.push(...productsWithErros);

  for (const product of payload) {
    const oldProduct = await fetchProduct(+product.product_code);
    const pack = await fetchPack(+product.product_code);
    const responseObject: IProductsResponse = {};
    if (pack) {
      const product = payload.filter(
        (product) => +product.product_code === +pack.product_id
      );
      const packProduct = payload.filter(
        (product) => +product.product_code === +pack.pack_id
      );
      if (product.length === 1) {
        let productPrice = +product[0].new_price * +pack.qty;
        let packPrice = +packProduct[0].new_price;
        const validate = +productPrice.toFixed(2) === +packPrice.toFixed(2);
        if (!validate) {
          const error = `O valor do produto 'R$ ${+product[0]
            .new_price}', vezes a quantidade '${+pack.qty}', não tem o valor igual ao do pack R$ '${+packProduct[0]
            .new_price}'`;
          responseObject.hasError = true;
          responseObject.errorMessages = [];
          responseObject.errorMessages?.push(error);
        }
      } else if (product.length > 1 || packProduct.length > 1) {
        const error = `Há produtos ou packs de produtos duplicados na atualização da lista de preços`;
        responseObject.hasError = true;
        responseObject.errorMessages = [];
        responseObject.errorMessages?.push(error);
      }
    }

    if (oldProduct) {
      responseObject.product_code = oldProduct.code;
      responseObject.name = oldProduct.name;
      responseObject.sales_price = +oldProduct.sales_price;

      if (+oldProduct.cost_price > +product.new_price) {
        const error = "O valor é menor que o custo do produto";
        responseObject.hasError = true;
        responseObject.errorMessages = [];
        responseObject.errorMessages?.push(error);
      } else if (
        +product.new_price >
          +oldProduct.sales_price + +oldProduct.sales_price * 0.1 ||
        +product.new_price <
          +oldProduct.sales_price - +oldProduct.sales_price * 0.1
      ) {
        const error =
          "O reajuste é maior ou menor que 10% do valor do produto!";
        responseObject.hasError = true;
        responseObject.errorMessages = [];
        responseObject.errorMessages?.push(error);
      } else {
        if (!responseObject.hasError) {
          await updateProductSalesPrice(
            +product.product_code,
            +product.new_price
          );
          responseObject.new_price = +product.new_price;
        }
      }
      productsResponse.push(responseObject);
    }
  }

  return productsResponse;
};

const fetchProduct = async (productCode: number): Promise<IProducts | null> => {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM products WHERE code = ?",
      [productCode]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0] as RowDataPacket;

      const product: IProducts = {
        code: row.code,
        name: row.name,
        cost_price: row.cost_price,
        sales_price: row.sales_price,
      };

      return product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao consultar banco de dados", error);
    throw error;
  } finally {
    await connection.end();
  }
};

const fetchPack = async (pack_id: number): Promise<IPackProducts | null> => {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM packs WHERE pack_id = ?",
      [pack_id]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0] as RowDataPacket;

      const product: IPackProducts = {
        id: row.id,
        pack_id: row.pack_id,
        product_id: row.product_id,
        qty: row.qty,
      };

      return product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao consultar banco de dados", error);
    throw error;
  } finally {
    await connection.end();
  }
};

const updateProductSalesPrice = async (
  productCode: number,
  newPrice: number
): Promise<void> => {
  const connection = await connectToDatabase();
  try {
    const updateQuery = `
          UPDATE products
          SET sales_price = ?
          WHERE code = ?
          `;
    await connection.execute(updateQuery, [newPrice, productCode]);
  } catch (error) {
    console.error("Erro ao atualizar o preço do produto", error);
    throw error;
  } finally {
    await connection.end();
  }
};
