import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from '../services';
import { AuthGuard } from '../auth/auth.guard';
import { Response } from 'express';
import { Response as Res } from '@nestjs/common';
import { Roles } from '../decorators/role.decorators';
import { RoleEnum } from '../enums/role.enum';
import { RolesGuard } from '../auth/role.guard';

@Controller('statistic')
export default class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('treatment') treatment?: string,
  ) {
    return this.statisticsService.getStatistics(startDate, endDate, treatment);
  }

  @Get('export')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async exportStatisticsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const buffer = await this.statisticsService.exportStatisticsToExcel(
      startDate,
      endDate,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=(${startDate} - ${endDate})-Reporte-Elegangsters.xlsx`,
    );

    res.end(buffer);
  }
}
