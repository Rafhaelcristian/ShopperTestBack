import connectToDatabase from "../database";
import { IProductRequest } from "../interfaces/products.interface";

export const updatePriceService = async (payload: IProductRequest[]) => {
  for (const product of payload) {
    await updateProductSalesPrice(+product.product_code, +product.new_price);
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
