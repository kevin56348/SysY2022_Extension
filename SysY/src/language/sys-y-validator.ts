import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { SysYAstType, Exp, LVal, VarDef, ConstDef } from './generated/ast.js';
import type { SysYServices } from './sys-y-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SysYServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SysYValidator;
    const checks: ValidationChecks<SysYAstType> = {
        LVal: [validator.checkMultiDimensionArray],
        VarDef: validator.checkMultiDimensionArrayDef,
        ConstDef: validator.checkMultiDimensionArrayDef,
        Exp: validator.checkExp
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SysYValidator {

    checkMultiDimensionArray(lvs: LVal, accept: ValidationAcceptor): void{
        if (lvs.exps.length > 2) {
            accept('error', 'Too many dimensions for this array' +  String(lvs.exps), { node: lvs, property: 'exps' });
        }
    }

    checkMultiDimensionArrayDef(lvs: VarDef | ConstDef, accept: ValidationAcceptor): void{
        if (lvs.const_exp.length > 2) {
            accept('error', 'Too many dimensions for this array declaration' +  String(lvs.const_exp), { node: lvs, property: 'const_exp' });
        }
    }

    checkExp(exp: Exp, accept: ValidationAcceptor): void {
        const num = exp.numint;
        if (typeof num === 'number') {
            if (!this.checkNum(num)) {
                accept('warning', 'Int overflow.', { node: exp, property: 'numint' });
            }
        }
    }

    checkNum(num: Number){
        const Maxnum: Number = 2147483647;
        const Minnum: Number = -2147483648;
        return num > Minnum && num < Maxnum;
    }
}
