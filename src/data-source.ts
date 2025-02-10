import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Appointment } from './entity/Appointment';
import { AppointmentService } from './entity/AppointmentService';
import { Customer } from './entity/Customer';
import { Service } from './entity/Service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

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
  entities: [Appointment, AppointmentService, Customer, Service],
  migrations: ['src/migration/*.ts'],
  subscribers: [],
});
