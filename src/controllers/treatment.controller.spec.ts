import { Test, TestingModule } from '@nestjs/testing';
import TreatmentController from './treatment.controller';
import { TreatmentService } from '../services';
import { CreateTreatmentDTO, UpdateTreatmentDTO } from '../dtos';

describe('TreatmentController', () => {
  let controller: TreatmentController;
  let service: TreatmentService;

  const mockTreatmentService = {
    getAllTreatments: jest.fn(() => []),
    getTreatment: jest.fn((id) => ({
      id,
      name: 'Corte Regular',
      price: 100.78,
      duration: 40,
      description: 'Corte al gusto del cliente sin ningun tratamiento',
    })),
    createTreatment: jest.fn((dto) => ({ id: 1, ...dto })),
    updateTreatment: jest.fn((id, dto) => ({ id, ...dto })),
    deleteTreatment: jest.fn((id) => ({ deleted: true })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentController],
      providers: [
        {
          provide: TreatmentService,
          useValue: mockTreatmentService,
        },
      ],
    }).compile();

    controller = module.get<TreatmentController>(TreatmentController);
    service = module.get<TreatmentService>(TreatmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all treatments', () => {
    expect(controller.getAllTreatments()).toEqual([]);
    expect(service.getAllTreatments).toHaveBeenCalled();
  });

  it('should get a treatment by id', () => {
    const id = 1;
    expect(controller.getTreatment(id)).toEqual({
      id,
      name: 'Corte Regular',
      price: 100.78,
      duration: 40,
      description: 'Corte al gusto del cliente sin ningun tratamiento',
    });
    expect(service.getTreatment).toHaveBeenCalledWith(id);
  });

  it('should create a new treatment', () => {
    const dto: CreateTreatmentDTO = {
      name: 'Corte Punk',
      price: 150,
      duration: 60,
      description: 'El ultimo grito de la moda',
    };
    expect(controller.createTreatment(dto)).toEqual({ id: 1, ...dto });
    expect(service.createTreatment).toHaveBeenCalledWith(dto);
  });

  it('should update a treatment', async () => {
    const id = 1;
    const dto: UpdateTreatmentDTO = { name: 'Updated', price: 200 };
    expect(await controller.updateTreatment(id, dto)).toEqual({ id, ...dto });
    expect(service.updateTreatment).toHaveBeenCalledWith(id, dto);
  });

  it('should delete a treatment', async () => {
    const id = 1;
    expect(await controller.deleteTreatment(id)).toEqual({ deleted: true });
    expect(service.deleteTreatment).toHaveBeenCalledWith(id);
  });
});
