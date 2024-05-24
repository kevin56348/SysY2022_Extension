import type { AstNode, ValidationAcceptor, ValidationChecks } from 'langium';
import { SysYAstType, isModel, Exp, ConstDecl, VarDecl } from './generated/ast.js';
import type { SysYServices } from './sys-y-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SysYServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SysYValidator;
    const checks: ValidationChecks<SysYAstType> = {
        Model: validator.checkMyIdent, 
        Exp: validator.checkMyNum
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SysYValidator {

    checkMyIdent(model: AstNode, accept: ValidationAcceptor): void {
        if (!isModel(model)) {
            throw new Error('');
        }
        // const myIdents = new Set();
        model.decls.forEach(de => {
            if (de.decls_spc.$type == "ConstDecl") {
                (de.decls_spc as ConstDecl).const_def.forEach(d => {
                    const str: string = d.idents.name;
                    if (!this.checkIdent(str)) {
                        accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                    }
                });
            } else if(de.decls_spc.$type == "VarDecl"){
                (de.decls_spc as VarDecl).var_def.forEach(d => {
                    const str: string = d.idents.name;
                    if (!this.checkIdent(str)) {
                        accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                    }
                });
            }
        });
    }
    
    checkMyNum(exps: Exp, accept: ValidationAcceptor): void {
        const num = exps.numint;
        if (typeof num === 'number') {
            if (!this.checkNum(num)) {
                accept('warning', 'Int overflow.', { node: exps, property: 'numint' });
            }
        }
    }

    checkIdent(str: string){
        let char: string = str.substring(0, 1);
        if ((char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') || char == '_'){
            return true;
        }
        return false;
    }

    checkNum(num: Number){
        const Maxnum: Number = 2147483647;
        const Minnum: Number = -2147483648;
        return num > Minnum && num < Maxnum;
    }
}
