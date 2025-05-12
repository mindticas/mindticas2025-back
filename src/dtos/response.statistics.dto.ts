import { Expose } from 'class-transformer';

export default class ResponseStatisticsDto {
  @Expose() totalEarnings: string;
  @Expose() totalServices: string;
  @Expose() totalCompletedAppointments: string;
  @Expose() totalCanceledAppointments: string;
  @Expose() totalTips: string;
  @Expose() totalSalesAmount: string;
}
