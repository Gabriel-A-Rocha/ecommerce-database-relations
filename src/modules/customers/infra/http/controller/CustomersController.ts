import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    // receive name and email from the request.body
    const { name, email } = request.body;

    // call user creation service
    const createCustomerService = container.resolve(CreateCustomerService);

    const customer = await createCustomerService.execute({ name, email });

    return response.json(customer);
  }
}
