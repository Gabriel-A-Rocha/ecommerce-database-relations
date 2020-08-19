import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import ProductsRepository from '@modules/products/infra/typeorm/repositories/ProductsRepository';
import { response } from 'express';
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

    const stockProducts = await this.productsRepository.findAllById(
      products.map(item => {
        return {
          id: item.id,
        };
      }),
    );

    console.log('stockProducts');
    console.log(stockProducts);

    if (stockProducts.length !== products.length) {
      throw new AppError('Incorrect product ID provided.', 400);
    }

    // add current price to the requested products
    const formattedProducts = products.map(item => {
      const stockProduct = stockProducts.find(
        product => product.id === item.id,
      );

      if (!stockProduct) {
        throw new AppError('Error during product search.', 400);
      }

      if (item.quantity > stockProduct.quantity) {
        throw new AppError('There is not enough stock available.', 400);
      }

      return {
        product_id: item.id,
        quantity: item.quantity,
        price: stockProduct.price,
      };
    });

    console.log('formattedProducts');
    console.log(formattedProducts);

    const order = await this.ordersRepository.create({
      customer,
      products: formattedProducts,
    });

    console.log('order');
    console.log(order);

    return order;
  }
}

export default CreateOrderService;
