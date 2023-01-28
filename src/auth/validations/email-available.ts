import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../../users/users.service';

@ValidatorConstraint({ async: true })
export class EmailAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);

    return !Boolean(user);
  }
}
export function EmailAvailable(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailAvailableConstraint,
    });
  };
}
