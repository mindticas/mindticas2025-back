import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUpdateDto, ProductCreateDto } from '../dtos';

@Injectable()
export default class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async get(): Promise<Product[]> {
    const products = await this.productRepository.find();

    if (!products) {
      throw new NotFoundException('No se encontraron productos');
    }

    return products;
  }

  async getById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: id } });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async create(createDto: ProductCreateDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: {
        name: createDto.name,
      },
    });

    if (existingProduct) {
      throw new Error('Product existente.');
    }
    try {
      const product = this.productRepository.create(createDto);
      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(`Error al crear el producto`);
    }
  }

  async update(id: number, dto: ProductUpdateDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    if (dto.name === product.name) {
      throw new BadRequestException(
        'El nombre del producto no puede ser el mismo que el existente',
      );
    }
    Object.assign(product, dto);
    try {
      return this.productRepository.save(product);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el producto');
    }
  }

  async delete(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    try {
      await this.productRepository.remove(product);
    } catch (error) {
      throw new InternalServerErrorException(`Error al eliminar el usuario`);
    }
  }
}
