export interface IProducts {
  code: number;
  name: string;
  cost_price: string;
  sales_price: string;
}

export interface IProductRequest {
  product_code: string;
  new_price: string;
  lineNumber?: number;
}

export interface IProductsResponse {
  lineNumber?: number;
  product_code?: number;
  name?: string;
  sales_price?: number;
  new_price?: number;
  hasError?: boolean;
  errorMessages?: string[];
}

export interface IPackProducts {
  id: number;
  pack_id: number;
  product_id: number;
  qty: number;
}
