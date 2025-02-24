import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TreatmentService } from '../services';
import { CreateTreatmentDTO, UpdateTreatmentDTO } from '../dtos';

@Controller('/treatment')
export default class TreatmentController {
  constructor(private treatmentService: TreatmentService) {}

  @Get()
  getAllServices() {
    return this.treatmentService.getAllTreatments();
  }
  @Get(':id')
  getTreatment(@Param('id', ParseIntPipe) id: number) {
    return this.treatmentService.getTreatment(id);
  }
  @Post()
  createTreatment(@Body() dto: CreateTreatmentDTO) {
    return this.treatmentService.createTreatment(dto);
  }
  @Patch(':id')
  async updateTreatment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTreatmentDTO: UpdateTreatmentDTO,
  ) {
    return await this.treatmentService.updateTreatment(id, updateTreatmentDTO);
  }
  @Delete(':id')
  async deleteTreatment(@Param('id', ParseIntPipe) id: number) {
    return this.treatmentService.deleteTreatment(id);
  }
}
