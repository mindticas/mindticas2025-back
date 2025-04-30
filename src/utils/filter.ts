import { Customer, User, Treatment } from '../entities';

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
  SERVICE_COUNT_ASC: (treatments: Treatment[]): Treatment[] => {
    return treatments.sort(
      (a, b) => a.appointments.length - b.appointments.length,
    );
  },
  SERVICE_COUNT_DESC: (treatments: Treatment[]): Treatment[] => {
    return treatments.sort(
      (a, b) => b.appointments.length - a.appointments.length,
    );
  },
  NAME_ASC: (treatments: Treatment[]): Treatment[] => {
    return treatments.sort((a, b) => a.name.localeCompare(b.name));
  },
  NAME_DESC: (treatments: Treatment[]): Treatment[] => {
    return treatments.sort((a, b) => b.name.localeCompare(a.name));
  },
};
