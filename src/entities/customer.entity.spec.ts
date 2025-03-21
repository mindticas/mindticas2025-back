import Customer from './customer.entity';
import { Appointment } from './index';

describe('Customer Entity', () => {
  let customer: Customer;

  beforeEach(() => {
    customer = new Customer();
    customer.id = 1;
    customer.name = 'Leonel Ceballos';
    customer.phone = '3125463221';
    customer.appointments = [];
  });

  it('should create a customer instance', () => {
    expect(customer).toBeInstanceOf(Customer);
  });

  it('should have the correct properties', () => {
    expect(customer.id).toBe(1);
    expect(customer.name).toBe('Leonel Ceballos');
    expect(customer.phone).toBe('3125463221');
  });

  it('should have an empty appointments array by default', () => {
    expect(customer.appointments).toEqual([]);
  });

  it('should allow adding appointments', () => {
    const appointment = new Appointment();
    appointment.id = 1;
    customer.appointments.push(appointment);

    expect(customer.appointments.length).toBe(1);
    expect(customer.appointments[0]).toBeInstanceOf(Appointment);
  });
});
