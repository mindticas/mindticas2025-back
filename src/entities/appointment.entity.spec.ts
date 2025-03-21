import Appointment from './appointment.entity';
import { Status } from '../enums/appointments.status.enum';
import { User, Customer, Treatment } from './index';

describe('Appointment Entity', () => {
  let appointment: Appointment;

  beforeEach(() => {
    appointment = new Appointment();
    appointment.id = 1;
    appointment.status = Status.PENDING;
    appointment.scheduled_start = new Date('2025-03-10T14:00:00Z');
    appointment.total_price = 150.5;
    appointment.duration = 60;
    appointment.created_at = new Date();
    appointment.updated_at = new Date();
    appointment.user = new User();
    appointment.customer = new Customer();
    appointment.treatments = [];
  });

  it('should create an appointment instance', () => {
    expect(appointment).toBeInstanceOf(Appointment);
  });

  it('should have the correct properties', () => {
    expect(appointment.id).toBe(1);
    expect(appointment.status).toBe(Status.PENDING);
    expect(appointment.scheduled_start).toBeInstanceOf(Date);
    expect(appointment.total_price).toBe(150.5);
    expect(appointment.duration).toBe(60);
    expect(appointment.created_at).toBeInstanceOf(Date);
    expect(appointment.updated_at).toBeInstanceOf(Date);
  });

  it('should have a user associated', () => {
    expect(appointment.user).toBeInstanceOf(User);
  });

  it('should have a customer associated', () => {
    expect(appointment.customer).toBeInstanceOf(Customer);
  });

  it('should have an empty treatments array by default', () => {
    expect(appointment.treatments).toEqual([]);
  });
});
