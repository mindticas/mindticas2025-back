import { Customer } from '../entities';

export default {
    SERVICE_COUNT_ASC: (customers: Customer[]): Customer[] => {
      return customers.sort((a, b) => a.appointments.length - b.appointments.length);
    },
    SERVICE_COUNT_DESC: (customers: Customer[]): Customer[] => {
      return customers.sort((a, b) => b.appointments.length - a.appointments.length);
    },
    CUSTOMER_NAME_ASC: (customers: Customer[]): Customer[] => {
      return customers.sort((a, b) => a.name.localeCompare(b.name));
    },
    CUSTOMER_NAME_DESC: (customers: Customer[]): Customer[] => {
      return customers.sort((a, b) => b.name.localeCompare(a.name));
    },
  };