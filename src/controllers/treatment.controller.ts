import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TreatmentService } from '../services';
import { CreateTreatmentDTO, UpdateTreatmentDTO } from '../dtos';
import { AuthGuard } from '../auth/auth.guard';

@Controller('treatment')
export default class TreatmentController {
  constructor(private treatmentService: TreatmentService) {}

  @Get()
  getAllTreatments() {
    return this.treatmentService.getAllTreatments();
  }

  @Get(':id')
  getTreatment(@Param('id') id: number) {
    return this.treatmentService.getTreatment(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  createTreatment(@Body() dto: CreateTreatmentDTO) {
    return this.treatmentService.createTreatment(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateTreatment(
    @Param('id') id: number,
    @Body() updateTreatmentDTO: UpdateTreatmentDTO,
  ) {
    return await this.treatmentService.updateTreatment(id, updateTreatmentDTO);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteTreatment(@Param('id') id: number) {
    return this.treatmentService.deleteTreatment(id);
  }
}
