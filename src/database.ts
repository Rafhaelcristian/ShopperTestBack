import "dotenv/config";
import * as mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB!,
};

async function connectToDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
}

export default connectToDatabase;
