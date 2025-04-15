import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Schedule from '../entities/schedule.entity';

@Injectable()
export default class ScheduleSeed {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  schedules = [
    {
      day: 'Lunes',
      open_hours: [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
      ],
    },
    {
      day: 'Martes',
      open_hours: [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
      ],
    },
    {
      day: 'Miércoles',
      open_hours: [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
      ],
    },
    {
      day: 'Jueves',
      open_hours: [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
      ],
    },
    {
      day: 'Viernes',
      open_hours: [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
      ],
    },
    {
      day: 'Sábado',
      open_hours: [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
      ],
    },
  ];

  async run() {
    for (const { day, open_hours } of this.schedules) {
      const existingSchedule = await this.scheduleRepository.findOneBy({ day });
      if (existingSchedule) {
        console.log(`\u{26A0} ${day} schedule already seeded.`);
        continue;
      }

      try {
        const scheduleEntity = this.scheduleRepository.create({
          day,
          open_hours,
        });
        await this.scheduleRepository.save(scheduleEntity);
      } catch (error) {
        console.error('Error seeding schedule:', error.message);
      }
    }
    console.log('\u{2705} Schedule seed completed');
  }
}
