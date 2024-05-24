// import type { ValidationAcceptor, ValidationChecks } from 'langium';
// import type { SysYAstType, Person } from './generated/ast.js';
import {ValidationAcceptor, ValidationChecks } from 'langium';
import type { SysYServices } from './sys-y-module.js';
import { SysYAstType, Model} from './generated/ast.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SysYServices) {

    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SysYValidator;
    const checks: ValidationChecks<SysYAstType> = {
        Model: [
            validator.checkUniqueFuncName,
            // validator.checkUniqueDeclaration
        ],
        // ConstDecl:  validator.checkConstDeclMatch
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SysYValidator {

    checkUniqueFuncName(m: Model, accept: ValidationAcceptor): void {
        const reported = new Set();
        m.funcdefs.forEach(d => {
            if (reported.has(d.func)) {
                accept('error', `Def has non-unique name '${d.func} : ${d.$type}'.`, {
                    node: d, property: 'func'
                });
            }
            reported.add(d.func);
        });
    }

    // checkUniqueDeclaration(m: Model, accept: ValidationAcceptor): void {
    //     const reported = new Set();
    //     m.decls.forEach(d => {
    //         if (reported.has(d)) {
    //             accept('error', `Def has non-unique name '${d.ident}': ${d.$type}.`, {
    //                 node: d, property: 'ident'
    //             });
    //         }
    //         reported.add(d.ident);
    //     });
    // }

    // checkConstDeclMatch(decl: ConstDecl, accept: ValidationAcceptor): void{
        
    // }

}
