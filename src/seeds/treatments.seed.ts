import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Treatment } from '../entities';

@Injectable()
export default class TreatmentSeed {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
  ) {}

  treatments = [
    {
      name: 'Corte',
      price: 150.00,
      duration: 60,
      description: 'Corte básico de cabello.',
    },
    {
      name: 'Corte y barba',
      price: 250.00,
      duration: 60,
      description: 'Corte básico de cabello y corte de barba.',
    },
    {
      name: 'Recorte y delineado de barba',
      price: 150.00,
      duration: 60,
      description: 'Recorte y delineado de barba.',
    },
    {
      name: 'Recorte.',
      price: 80.00,
      duration: 60,
      description: 'Recorte básico.',
    },
    {
      name: 'Ceja',
      price: 50.00,
      duration: 60,
      description: 'Limpieza de ceja.',
    },
    {
      name: 'Exfolación',
      price: 130.00,
      duration: 60,
      description: 'Exfolación.',
    },
    {
      name: 'PAQUETE GANGSTER',
      price: 200.00,
      duration: 60,
      description:
        'Mascarilla facial, Limpieza de ceja, corte de cabello y bebida de cortesía.',
    },
    {
      name: 'PAQUETE ELEGANGSTER',
      price: 300.00,
      duration: 60,
      description:
        'Mascarilla facial, Limpieza de ceja, corte de cabello, recorte y delineado de barba, exfolación y bebida de cortesía.',
    },
  ];

  async run() {
    for (const { name, price, duration, description } of this.treatments) {
      const existingTreatment = await this.treatmentRepository.findOneBy({
        name,
      });
      if (existingTreatment) {
        continue;
      }

      try {
        const treatmentEntity = this.treatmentRepository.create({
          name,
          price,
          duration,
          description,
        });
        await this.treatmentRepository.save(treatmentEntity);
      } catch (error) {
        console.error('Error seeding treatment:', error.message);
      }
    }
    console.log('\u{2705} Treatment seed completed');
  }
}
