import Treatment from './treatment.entity';

describe('Treatment Entity', () => {
  let treatment: Treatment;

  beforeEach(() => {
    treatment = new Treatment();
    treatment.id = 1;
    treatment.name = 'Corte Regular';
    treatment.price = 100.78;
    treatment.duration = 40;
    treatment.description = 'Corte al gusto del cliente sin ningun tratamiento';
    treatment.appointments = [];
  });

  it('should create a treatment instance', () => {
    expect(treatment).toBeInstanceOf(Treatment);
  });

  it('should have the correct properties', () => {
    expect(treatment.id).toBe(1);
    expect(treatment.name).toBe('Corte Regular');
    expect(treatment.price).toBe(100.78);
    expect(treatment.duration).toBe(40);
    expect(treatment.description).toBe(
      'Corte al gusto del cliente sin ningun tratamiento',
    );
  });

  it('should have an empty appointments array by default', () => {
    expect(treatment.appointments).toEqual([]);
  });
});
