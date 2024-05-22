import type { AstNode, ValidationAcceptor, ValidationChecks } from 'langium';
import { SysYAstType, isMainFuncDef, isModel } from './generated/ast.js';
import type { SysYServices } from './sys-y-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SysYServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SysYValidator;
    const checks: ValidationChecks<SysYAstType> = {
        // Person: validator.checkPersonStartsWithCapital
        Model: validator.checkMyIdent, 
        MainFuncDef: validator.checkMyNum
        // FuncDef: validator.checkFuncDef,
        // MainFuncDef: validator.checkMainFuncDef,
    };
    registry.register(checks, validator);
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

    // checkDecl(decl: Decl, accept: ValidationAcceptor): void {
    //     if (decl.ident) {
    //         const str: string = decl.ident;
    //         if (!this.checkIdent(str)) {
    //             accept('warning', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: decl, property: 'ident' });
    //         }
    //     }
    //     if (decl.number) {
    //         const num = decl.number;
    //         if (1) {
    //             accept('warning', 'Int overflow.' + String(num), { node: decl, property: 'number' });
    //         }
    //     }
    // }

    // checkDecl(model: AstNode, accept: ValidationAcceptor): void {
    //     if (!isModel(model)) {
    //         throw new Error('');
    //     }
    //     model.decls.forEach(d => {
    //         const str: string = d.ident;
    //         if (!this.checkIdent(str)) {
    //             accept('warning', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'ident' });
    //         }
    //     });
    // }

    checkMyIdent(model: AstNode, accept: ValidationAcceptor): void {
        if (!isModel(model)) {
            throw new Error('');
        }
        // model.decls.forEach(de => {
        //     de.idents.forEach(d => {
        //         const str: string = d.name;
        //         if (!this.checkIdent(str)) {
        //             accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'name' });
        //         }
        //     });
        // });
        // const myIdents = new Set();
        model.decls.forEach(de => {
            de.idents.forEach(d => {
                const str: string = d.name;
                if (!this.checkIdent(str)) {
                    accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'name' });
                }
            });
        });
        model.decls.forEach(d => {
            const num = d.numint;
            // accept('warning', 'Int overflow.' + (typeof num) + String(num), { node: d, property: 'numint' });
            if (typeof num === 'number') {
                // accept('warning', 'Int overflow.' + String(num) + String(this.checkNum(num)), { node: d, property: 'numint' });
                if (!this.checkNum(num)) {
                    accept('warning', 'Int overflow.' + String(num) + String(this.checkNum(num)), { node: d, property: 'numint' });
                }
            }
        });
        model.mainfuncdef.decls.forEach(d => {
            const num = d.numint;
            // accept('warning', 'Int overflow.' + (typeof num) + String(num), { node: d, property: 'numint' });
            if (typeof num === 'number') {
                // accept('warning', 'Int overflow.' + String(num) + String(this.checkNum(num)), { node: d, property: 'numint' });
                if (!this.checkNum(num)) {
                    accept('warning', 'Int overflow.' + String(num) + String(this.checkNum(num)), { node: d, property: 'numint' });
                }
            }
        });
        // const num = model.mainfuncdef.numint;
        // accept('warning', 'Int overflow.' + String(num), { node: model.mainfuncdef, property: 'numint' });
        // if (typeof num === 'number')
        //     if (!this.checkNum(num)) {
        //         accept('warning', 'Int overflow.' + String(num), { node: model.mainfuncdef, property: 'numint' });
        //     }
    }
    checkMyNum(model: AstNode, accept: ValidationAcceptor): void {
        if (!isMainFuncDef(model)) {
            throw new Error('2');
        }
        // const num = model.numint;
        // accept('warning', 'Int overflow.' + (typeof num) + String(num), { node: model, property: 'numint' });
        // if (typeof num === 'number') {
        //     // accept('warning', 'Int overflow.' + String(num) + String(this.checkNum(num)), { node: model, property: 'numint' });
        //     if (!this.checkNum(num)) {
        //         accept('warning', 'Int overflow.' + String(num) + String(this.checkNum(num)), { node: model, property: 'numint' });
        //     }
        // }
    }

    // checkFuncDef(funcdef: FuncDef, accept: ValidationAcceptor): void {
    //     if (funcdef.ident) {
    //         const str = funcdef.ident;
    //         if (!this.checkIdent(str)) {
    //             accept('warning', 'Idents should be started with _ a-z A-Z.', { node: funcdef, property: 'ident' });
    //         }
    //     }
    //     if (funcdef.number) {
    //         const num = funcdef.number;
    //         if (!this.checkNum(num)) {
    //             accept('error', 'Int overflow.' , { node: funcdef, property: 'number' });
    //         }
    //     }
    // }

    // checkMainFuncDef(mainfuncdef: MainFuncDef, accept: ValidationAcceptor): void {
    //     if (mainfuncdef.ident) {
    //         // const firstChar = mainfuncdef.ident;
    //         // let pattern: RegExp = /[_a-zA-Z]/;
    //         const str = mainfuncdef.ident;
    //         if (!this.checkIdent(str)) {
    //             accept('warning', 'Idents should be started with _ a-z A-Z.', { node: mainfuncdef, property: 'ident' });
    //         }
    //     }
    //     if (mainfuncdef.number) {
    //         const num = mainfuncdef.number;
    //         if (!this.checkNum(num)) {
    //             accept('error', 'Int overflow.' , { node: mainfuncdef, property: 'number' });
    //         }
    //     }
    // }

    checkIdent(str: string){
        let char: string = str.substring(0, 1);
        if ((char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        char == '_'){
            return true;
        }
        return false;
    }

    checkNum(num: Number){
        const Maxnum: Number = 2147483647;
        const Minnum: Number = -2147483648;
        if (num > Maxnum || num < Minnum){
            return false;
        }
        return true;
    }
}
