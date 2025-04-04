import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .select([
        "COALESCE(SUM(CASE WHEN appointment.status = 'completed' " +
          'THEN appointment.total_price ELSE 0 END), 0) AS totalEarnings',
        'COALESCE(COUNT(appointment.id), 0) AS totalServices',
        "COALESCE(SUM(CASE WHEN appointment.status = 'completed' THEN 1 ELSE 0 END)," +
          ' 0) AS totalCompletedAppointments',
        "COALESCE(SUM(CASE WHEN appointment.status = 'canceled' THEN 1 ELSE 0 END), 0)" +
          'AS totalCanceledAppointments',
      ])
      .where(
        'DATE(appointment.scheduled_start) BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );

    if (treatment) {
      queryBuilder.innerJoin(
        'appointment.treatments',
        'treatment',
        'treatment.name = :treatment',
        { treatment },
      );
    }

    const rawResult = await queryBuilder.getRawOne();

    return plainToClass(ResponseStatisticsDto, {
      totalEarnings: rawResult.totalearnings,
      totalServices: rawResult.totalservices,
      totalCompletedAppointments: rawResult.totalcompletedappointments,
      totalCanceledAppointments: rawResult.totalcanceledappointments,
    });
  }
}
