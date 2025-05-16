import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TreatmentService } from '../services';
import { CreateTreatmentDTO, UpdateTreatmentDTO } from '../dtos';
import { AuthGuard } from '../auth/auth.guard';
import { Treatment } from '../entities';

@Controller('treatments')
export default class TreatmentController {
  constructor(private treatmentService: TreatmentService) {}

  @Get()
  async get(@Query('param') param: string): Promise<Treatment[]> {
    return await this.treatmentService.get(param);
  }

  @Get(':id')
  getById(@Param('id') id: number) {
    return this.treatmentService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateTreatmentDTO) {
    return this.treatmentService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateTreatmentDTO: UpdateTreatmentDTO,
  ) {
    return await this.treatmentService.update(id, updateTreatmentDTO);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: number) {
    return this.treatmentService.delete(id);
  }
}
