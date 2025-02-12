import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Appointment, Customer, Service, User, Role } from './entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import 'dotenv/config';
// require('dotenv').config();

const HOST = process.env.PGHOST || 'localhost';
const PORT = parseInt(process.env.PGPORT);
const USERNAME = process.env.PGUSER;
const PASSWORD = process.env.PGPASSWORD || 'undefined';
const DATABASE = process.env.PGDATABASE;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: HOST,
  port: PORT,
  username: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  synchronize: true,
  logging: false,
  entities: [Appointment, Customer, Service, User, Role],
  migrations: ['. /migration/*.ts'],
  subscribers: [],
});
