import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Appointment, Treatment } from '../entities/index';
import { ResponseStatisticsDto } from '../dtos';
import { plainToClass } from 'class-transformer';
import * as ExcelJS from 'exceljs';

@Injectable()
export default class StatisticsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
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

  async exportStatisticsToExcel(
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    const treatmentNames = await this.getAllTreatments();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estadísticas');

    worksheet.columns = [
      { header: 'Tratamiento', key: 'treatment', width: 30 },
      { header: 'Total Ingresos', key: 'totalEarnings', width: 20 },
      { header: 'Total Servicios', key: 'totalServices', width: 20 },
      {
        header: 'Citas Completadas',
        key: 'totalCompletedAppointments',
        width: 20,
      },
      {
        header: 'Citas Canceladas',
        key: 'totalCanceledAppointments',
        width: 20,
      },
    ];
    const headerRow = worksheet.getRow(1);
    headerRow.getCell('treatment').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }, // Gris claro
    };
    headerRow.getCell('totalEarnings').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }, // Verde
    };
    headerRow.getCell('totalServices').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF99' }, // Amarillo
    };
    headerRow.getCell('totalCompletedAppointments').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9BC2E6' }, // Azul claro
    };
    headerRow.getCell('totalCanceledAppointments').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF9999' }, // Rojo suave
    };

    for (const treatment of treatmentNames) {
      const stats = await this.getStatistics(startDate, endDate, treatment);

      worksheet.addRow({
        treatment,
        totalEarnings: stats.totalEarnings,
        totalServices: stats.totalServices,
        totalCompletedAppointments: stats.totalCompletedAppointments,
        totalCanceledAppointments: stats.totalCanceledAppointments,
      });
    }

    worksheet.addRow({});
    const totalStats = await this.getStatistics(startDate, endDate);

    worksheet.addRow({
      treatment: 'Total',
      totalEarnings: totalStats.totalEarnings,
      totalServices: totalStats.totalServices,
      totalCompletedAppointments: totalStats.totalCompletedAppointments,
      totalCanceledAppointments: totalStats.totalCanceledAppointments,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async getAllTreatments(): Promise<string[]> {
    const treatments = await this.treatmentRepository.find({
      select: ['name'],
      order: { name: 'ASC' },
    });

    return treatments.map((treatment) => treatment.name);
  }
}
