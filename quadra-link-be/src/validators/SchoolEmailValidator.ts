import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions
} from 'class-validator';
import { schoolEmailPatterns } from '../config/school-patterns';

@ValidatorConstraint({ name: 'SchoolEmailValidator', async: false })
export class SchoolEmailValidator implements ValidatorConstraintInterface {
  validate(email: any, args: ValidationArguments): boolean {
    // Get the whole object being validated
    const object = args.object as any;
    const schoolRaw = object.school;

    if (typeof email !== 'string' || typeof schoolRaw !== 'string') {
      return false;
    }

    const schoolKey = schoolRaw.toUpperCase().trim();
    const pattern = schoolEmailPatterns[schoolKey];
    if (!pattern) {
      // If school is unknown, you may reject or allow by default
      // Here, reject
      return false;
    }

    return pattern.test(email);
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const schoolRaw = object.school;
    const schoolKey = (typeof schoolRaw === 'string' ? schoolRaw.toUpperCase().trim() : schoolRaw);
    if (schoolKey && schoolEmailPatterns[schoolKey]) {
      return `Email is not valid for the school ${schoolRaw}`;
    }
    return `Unknown school ${schoolRaw}`;
  }
}

// Decorator helper
export function IsSchoolEmailValid(
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsSchoolEmailValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: SchoolEmailValidator,
    });
  };
}
