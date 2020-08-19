import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      name,
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const stockProducts = await this.ormRepository.findByIds(products);

    return stockProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const idsToUpdate = products.map(item => item.id);

    const stockProducts = await this.ormRepository.findByIds(idsToUpdate);

    if (!stockProducts) {
      throw new AppError('Error during stock quantity update.');
    }

    const updatedStockProducts = stockProducts.map(stockProduct => {
      const productFromRequest = products.find(
        item => item.id === stockProduct.id,
      );

      if (!productFromRequest) {
        throw new AppError('Error during stock quantity update.');
      }

      return {
        ...stockProduct,
        quantity: stockProduct.quantity - productFromRequest.quantity,
      };
    });

    return updatedStockProducts;
  }
}

export default ProductsRepository;
