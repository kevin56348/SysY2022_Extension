// import type { ValidationAcceptor, ValidationChecks } from 'langium';
// import type { SysYAstType, Person } from './generated/ast.js';
import type { SysYServices } from './sys-y-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SysYServices) {
    // const registry = services.validation.ValidationRegistry;
    // const validator = services.validation.SysYValidator;
    // const checks: ValidationChecks<SysYAstType> = {
    //     Person: validator.checkPersonStartsWithCapital
    // };
    // registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SysYValidator {

    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }

}
