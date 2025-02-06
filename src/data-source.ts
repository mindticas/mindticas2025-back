import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const HOST = process.env.DB_HOST || 'localhost';
const PORT = parseInt(process.env.DB_PORT);
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD || 'undefined';
const DATABASE = process.env.DB_DATABASE;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: HOST,
  port: PORT,
  username: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
