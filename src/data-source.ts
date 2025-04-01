import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  Appointment,
  Customer,
  Treatment,
  User,
  Role,
  GoogleToken,
} from './entities';

import 'dotenv/config';

const HOST = process.env.PGHOST || 'localhost';
const PORT = parseInt(process.env.PGPORT || '5432', 10);
const USERNAME = process.env.PGUSER || 'postgres';
const PASSWORD = process.env.PGPASSWORD || 'password';
const DATABASE = process.env.PGDATABASE || 'mydatabase';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: HOST,
  port: PORT,
  username: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  synchronize: process.env.PGDBSYNC === 'true',
  migrationsRun: true,
  logging: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [Appointment, Customer, Treatment, User, Role, GoogleToken],
  migrations: ['./migration/*.ts'],
  subscribers: [],
});
