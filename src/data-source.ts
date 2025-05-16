import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  Appointment,
  Customer,
  Treatment,
  User,
  Role,
  GoogleToken,
  Schedule,
  Product,
  UserProfile,
} from './entities';
import * as path from 'path';

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
  migrationsTableName: 'migrations',
  logging: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    Appointment,
    Customer,
    Treatment,
    User,
    Role,
    GoogleToken,
    Schedule,
    Product,
    UserProfile,
  ],
  migrations: [path.resolve(__dirname, 'migration', '*.ts')],
  subscribers: [],
});
