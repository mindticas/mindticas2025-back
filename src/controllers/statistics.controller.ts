import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from '../services';
import { AuthGuard } from '../auth/auth.guard';

@Controller('statistic')
export default class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(AuthGuard)
  getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('treatment') treatment?: string,
  ) {
    return this.statisticsService.getStatistics(startDate, endDate, treatment);
  }
}
