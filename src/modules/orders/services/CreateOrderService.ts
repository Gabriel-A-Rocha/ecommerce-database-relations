import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // identify customer
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('This customer ID does not exist.', 400);
    }

    // retrieve desired products from the database
    const productsIDs = products.map(item => {
      return {
        id: item.id,
      };
    });

    const stockProducts = await this.productsRepository.findAllById(
      productsIDs,
    );

    const formattedProducts = products.map(item => {
      return {
        ...item,
        quantity: 1,
      };
    });

    const orderCreated = await this.ordersRepository.create({
      customer,
      formattedProducts,
    });
  }
}

export default CreateOrderService;
