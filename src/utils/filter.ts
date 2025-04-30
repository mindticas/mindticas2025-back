import { Customer, User, Treatment } from '../entities';
import { SelectQueryBuilder } from 'typeorm';

export const customerFilters = {
  SERVICE_COUNT_ASC: (customers: Customer[]): Customer[] => {
    return customers.sort(
      (a, b) => a.appointments.length - b.appointments.length,
    );
  },
  SERVICE_COUNT_DESC: (customers: Customer[]): Customer[] => {
    return customers.sort(
      (a, b) => b.appointments.length - a.appointments.length,
    );
  },
  NAME_ASC: (customers: Customer[]): Customer[] => {
    return customers.sort((a, b) => a.name.localeCompare(b.name));
  },
  NAME_DESC: (customers: Customer[]): Customer[] => {
    return customers.sort((a, b) => b.name.localeCompare(a.name));
  },
};

export const userFilters = {
  SERVICE_COUNT_ASC: (users: User[]): User[] => {
    return users.sort((a, b) => a.appointments.length - b.appointments.length);
  },
  SERVICE_COUNT_DESC: (users: User[]): User[] => {
    return users.sort((a, b) => b.appointments.length - a.appointments.length);
  },
  NAME_ASC: (users: User[]): User[] => {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  },
  NAME_DESC: (users: User[]): User[] => {
    return users.sort((a, b) => b.name.localeCompare(a.name));
  },
};

export const treatmentFilters = {
  SERVICE_COUNT_ASC: (treatment) =>
    treatment
      .leftJoin('treatment.appointments', 'appointment')
      .addSelect('COUNT(appointment.id)', 'appointments_count')
      .groupBy('treatment.id')
      .orderBy('appointments_count', 'ASC'),

  SERVICE_COUNT_DESC: (treatment) =>
    treatment
      .leftJoin('treatment.appointments', 'appointment')
      .addSelect('COUNT(appointment.id)', 'appointments_count')
      .groupBy('treatment.id')
      .orderBy('appointments_count', 'DESC'),

  NAME_ASC: (treatment) => treatment.orderBy('treatment.name', 'ASC'),

  NAME_DESC: (treatment) => treatment.orderBy('treatment.name', 'DESC'),
};
