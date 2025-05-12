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
import * as ExcelJS from 'exceljs';
import TreatmentService from './treatment.service';
import type { FillPattern } from 'exceljs';

@Injectable()
export default class StatisticsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly treatmentService: TreatmentService,
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
      totalTips,
      totalSalesAmount,
    ] = await Promise.all([
      this.getTotalEarnings(startDate, endDate, treatment),
      this.getTotalServices(startDate, endDate, treatment),
      this.getTotalCompletedAppointments(startDate, endDate, treatment),
      this.getTotalCanceledAppointments(startDate, endDate, treatment),
      this.getTotalTips(startDate, endDate, treatment),
      this.getTotalSalesAmount(startDate, endDate, treatment),
    ]);

    return plainToClass(ResponseStatisticsDto, {
      totalEarnings,
      totalServices,
      totalCompletedAppointments,
      totalCanceledAppointments,
      totalTips,
      totalSalesAmount,
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
        .select(
        `COALESCE(SUM(appointment.total_price + 
                      COALESCE(appointment.tipAmount, 0) + 
                      COALESCE(appointment.salesAmount, 0)), 0)`,
        'totalearnings',
      );

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

  private async getTotalTips(
    startDate: string,
    endDate: string,
    treatment?: string,
  ): Promise<number> {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('COALESCE(SUM(appointment.tipAmount), 0)', 'totaltips')
      .innerJoin('appointment.treatments', 'treatment');
  
    qb.where('DATE(appointment.scheduled_start) BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
  
    qb.andWhere("appointment.status = 'completed'");
  
    if (treatment) {
      qb.andWhere('treatment.name = :treatment', { treatment });
    }
  
    const result = await qb.getRawOne();
    return Number(result?.totaltips);
  }
  
  private async getTotalSalesAmount(
    startDate: string,
    endDate: string,
    treatment?: string,
  ): Promise<number> {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('COALESCE(SUM(appointment.salesAmount), 0)', 'totalsales')
      .innerJoin('appointment.treatments', 'treatment');
  
    qb.where('DATE(appointment.scheduled_start) BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });
  
    qb.andWhere("appointment.status = 'completed'");
  
    if (treatment) {
      qb.andWhere('treatment.name = :treatment', { treatment });
    }
  
    const result = await qb.getRawOne();
    return Number(result?.totalsales);
  }  

  async exportStatisticsToExcel(startDate: string, endDate: string): Promise<Buffer> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Fechas requeridas.');
    }

    const treatmentNames = await this.treatmentService.getAllTreatmentsNames();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Informe');

    const headerFill: FillPattern = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9EAD3' },
    };
    const bold = { bold: true };

    worksheet.getCell('A1').value = 'Tratamiento';
    worksheet.getCell('B1').value = 'Cantidad';
    worksheet.getCell('C1').value = 'Ingresos';
    worksheet.getCell('D1').value = 'Citas Completadas';
    worksheet.getCell('E1').value = 'Citas Canceladas';

    ['A1', 'B1', 'C1', 'D1', 'E1'].forEach((cell) => {
      worksheet.getCell(cell).fill = headerFill;
      worksheet.getCell(cell).font = bold;
      worksheet.getCell(cell).alignment = { horizontal: 'center' };
    });

    let rowIndex = 2;
    let totalServices = 0;
    let totalEarnings = 0;

    for (const treatment of treatmentNames) {
      const stats = await this.getStatistics(startDate, endDate, treatment);
      worksheet.getCell(`A${rowIndex}`).value = treatment;
      worksheet.getCell(`B${rowIndex}`).value = stats.totalServices;
      worksheet.getCell(`C${rowIndex}`).value = stats.totalEarnings;
      worksheet.getCell(`D${rowIndex}`).value = stats.totalCompletedAppointments;
      worksheet.getCell(`E${rowIndex}`).value = stats.totalCanceledAppointments;
      totalServices += Number(stats.totalServices);
      totalEarnings += Number(stats.totalEarnings);
      rowIndex++;
    }

    worksheet.getCell(`A${rowIndex}`).value = 'Total';
    worksheet.getCell(`B${rowIndex}`).value = totalServices;
    worksheet.getCell(`C${rowIndex}`).value = totalEarnings;
    worksheet.getCell(`A${rowIndex}`).font = bold;
    worksheet.getCell(`B${rowIndex}`).font = bold;
    worksheet.getCell(`C${rowIndex}`).font = bold;

    const totalTips = await this.getTotalTips(startDate, endDate);
    const totalSales = await this.getTotalSalesAmount(startDate, endDate);
    const finalTotal = totalEarnings + totalTips + totalSales;

    const resumen = [
      ['Propinas Totales', totalTips],
      ['Ventas Totales', totalSales],
      ['Total Ingresos', finalTotal],
    ];

    const resumenStartRow = 2;
    const resumenStartCol = 'G';

    resumen.forEach(([label, value], i) => {
      const labelCell = worksheet.getCell(`${resumenStartCol}${resumenStartRow + i}`);
      const valueCell = worksheet.getCell(`${String.fromCharCode(resumenStartCol.charCodeAt(0) + 1)}${resumenStartRow + i}`);
      labelCell.value = label;
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: label === 'Total Ingresos' ? 'FFEAD1DC' : 'FFD9EAD3',
        },
      };
      labelCell.font = { bold: label === 'Total Ingresos' };
      valueCell.value = value;
    });

    worksheet.columns = [
      { width: 25 },
      { width: 12 },
      { width: 14 },
      { width: 20 },
      { width: 20 },
      {},
      { width: 20 },
      { width: 14 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
