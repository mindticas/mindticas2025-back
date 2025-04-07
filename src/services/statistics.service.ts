import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Appointment } from '../entities/index';
import { ResponseStatisticsDto } from '../dtos';
import { plainToClass } from 'class-transformer';

@Injectable()
export default class StatisticsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async getStatistics(startDate: string, endDate: string, treatment?: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Las fechas de inicio y fin son obligatorias.',
      );
    }

    const [
      totalEarnings,
      totalServices,
      totalCompletedAppointments,
      totalCanceledAppointments,
    ] = await Promise.all([
      this.getTotalEarnings(startDate, endDate, treatment),
      this.getTotalServices(startDate, endDate, treatment),
      this.getTotalCompletedAppointments(startDate, endDate, treatment),
      this.getTotalCanceledAppointments(startDate, endDate, treatment),
    ]);

    return plainToClass(ResponseStatisticsDto, {
      totalEarnings,
      totalServices,
      totalCompletedAppointments,
      totalCanceledAppointments,
    });
  }

  private applyFilters(
    qb: SelectQueryBuilder<Appointment>,
    startDate: string,
    endDate: string,
    treatment?: string,
  ): SelectQueryBuilder<Appointment> {
    qb.where(
      'DATE(appointment.scheduled_start) BETWEEN :startDate AND :endDate',
      { startDate, endDate },
    );

    if (treatment) {
      qb.innerJoin(
        'appointment.treatments',
        'treatment',
        'treatment.name = :treatment',
        { treatment },
      );
    }

    return qb;
  }

  private async getTotalEarnings(
    startDate: string,
    endDate: string,
    treatment?: string,
  ): Promise<number> {
    try {
      const qb = this.appointmentRepository
        .createQueryBuilder('appointment')
        .select('COALESCE(SUM(appointment.total_price), 0)', 'totalearnings');

      this.applyFilters(qb, startDate, endDate, treatment);
      qb.andWhere("appointment.status = 'completed'");

      const result = await qb.getRawOne();
      return Number(result?.totalearnings);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al calcular los ingresos totales.',
      );
    }
  }

  private async getTotalServices(
    startDate: string,
    endDate: string,
    treatment?: string,
  ): Promise<number> {
    try {
      const qb = this.appointmentRepository
        .createQueryBuilder('appointment')
        .select('COALESCE(COUNT(appointment.id), 0)', 'totalservices');

      this.applyFilters(qb, startDate, endDate, treatment);

      const result = await qb.getRawOne();
      return Number(result?.totalservices);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al calcular el número total de servicios.',
      );
    }
  }

  private async getTotalCompletedAppointments(
    startDate: string,
    endDate: string,
    treatment?: string,
  ): Promise<number> {
    try {
      const qb = this.appointmentRepository
        .createQueryBuilder('appointment')
        .select(
          'COALESCE(COUNT(appointment.id), 0)',
          'totalcompletedappointments',
        );

      this.applyFilters(qb, startDate, endDate, treatment);
      qb.andWhere("appointment.status = 'completed'");

      const result = await qb.getRawOne();
      return Number(result?.totalcompletedappointments);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al calcular las citas completadas.',
      );
    }
  }

  private async getTotalCanceledAppointments(
    startDate: string,
    endDate: string,
    treatment?: string,
  ): Promise<number> {
    try {
      const qb = this.appointmentRepository
        .createQueryBuilder('appointment')
        .select(
          'COALESCE(COUNT(appointment.id), 0)',
          'totalcanceledappointments',
        );

      this.applyFilters(qb, startDate, endDate, treatment);
      qb.andWhere("appointment.status = 'canceled'");

      const result = await qb.getRawOne();
      return Number(result?.totalcanceledappointments);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al calcular las citas canceladas.',
      );
    }
  }
}
