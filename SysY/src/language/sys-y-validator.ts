import type { AstNode, ValidationAcceptor, ValidationChecks } from 'langium';
import { SysYAstType, isModel, Exp, ConstDecl, VarDecl, LVal } from './generated/ast.js';
import type { SysYServices } from './sys-y-module.js';
// import * as vscode from 'vscode';
import {IdentTable} from './IdentTable.js'

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SysYServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SysYValidator;
    const checks: ValidationChecks<SysYAstType> = {
        Model: validator.checkMyIdent, 
        // FuncDef: validator.checkFunc,
        Exp: validator.checkExp,
        LVal: validator.checkLVal
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SysYValidator {

    // IdentsTable = new Set();
    IdentsTable = new IdentTable();

    checkMyIdent(model: AstNode, accept: ValidationAcceptor): void {
        if (!isModel(model)) {
            throw new Error('');
        }
        
        // const myIdents = new Set();
        model.decls.forEach(de => {
            if (de.decls_spc.$type == "ConstDecl") {
                (de.decls_spc as ConstDecl).const_def.forEach(d => {
                    const str: string = d.idents.name;
                    // myIdents.add(str);
                    this.IdentsTable.add(str, 0, 0, 'global');
                    // accept('error', String(myIdents.size) + str, { node: d, property: 'idents' });
                    if (!this.checkIdent(str)) {
                        accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                    }
                });
            } else if(de.decls_spc.$type == "VarDecl"){
                (de.decls_spc as VarDecl).var_def.forEach(d => {
                    const str: string = d.idents.name;
                    // accept('error', String(myIdents.size) + str, { node: d, property: 'idents' });
                    // myIdents.add(str);
                    this.IdentsTable.add(str, 0, 0, 'global');
                    if (!this.checkIdent(str)) {
                        accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                    }
                });
            }
        });
        // this.IdentsTable.set('global', myIdents);

        model.funcdefs.forEach(func => {
            // const myIdents = new Set();
            if (func.funcfps){
                func.funcfps.funcfp.forEach(f => {
                    const str:string = f.ident.name;
                    // myIdents.add(str);
                    this.IdentsTable.add(str, 0, 1, func.func);
                });
            }
            func.blks.bis.forEach(bi => {
                bi.decls.forEach(de => {
                    if (de.decls_spc.$type == "ConstDecl") {
                        (de.decls_spc as ConstDecl).const_def.forEach(d => {
                            const str: string = d.idents.name;
                            // myIdents.add(str);
                            this.IdentsTable.add(str, 0, 1, func.func);
                            if (!this.checkIdent(str)) {
                                accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                            }
                        });
                    } else if(de.decls_spc.$type == "VarDecl"){
                        (de.decls_spc as VarDecl).var_def.forEach(d => {
                            const str: string = d.idents.name;
                            // myIdents.add(str);
                            this.IdentsTable.add(str, 0, 1, func.func);
                            if (!this.checkIdent(str)) {
                                accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                            }
                        });
                    }
                });
            });
            // this.IdentsTable.set(func.func, myIdents);
        });

        model.mainfuncdef.blks.bis.forEach(bi => {
            bi.decls.forEach(de => {
                if (de.decls_spc.$type == "ConstDecl") {
                    (de.decls_spc as ConstDecl).const_def.forEach(d => {
                        const str: string = d.idents.name;
                        // myIdents.add(str);
                        this.IdentsTable.add(str, 0, 1, 'main');
                        if (!this.checkIdent(str)) {
                            accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                        }
                    });
                } else if(de.decls_spc.$type == "VarDecl"){
                    (de.decls_spc as VarDecl).var_def.forEach(d => {
                        const str: string = d.idents.name;
                        // myIdents.add(str);
                        this.IdentsTable.add(str, 0, 1, 'main');
                        if (!this.checkIdent(str)) {
                            accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
                        }
                    });
                }
            });
        });
    }
    
    // checkFunc(func: FuncDef, accept: ValidationAcceptor): void {
    //     func.blks.bis.forEach(bi=>{
    //         bi.decls.forEach(de=>{
    //             if (de.decls_spc.$type == "ConstDecl") {
    //                 (de.decls_spc as ConstDecl).const_def.forEach(d => {
    //                     d.const_exp.forEach(cexp => {
    //                         accept('error', 'd.const_exp', { node: cexp, property: 'lv' });
                            
    //                         cexp.exps.forEach(e => {
    //                             accept('error', 'ExpExp', { node: e, property: 'idents' });
    //                             e.idents.forEach(ident =>{
    //                                 accept('error', ident.name + ' ExpExp', { node: ident, property: 'name' });
    //                             });
    //                         });

    //                         cexp.idents.forEach(ident =>{
    //                             accept('error', ident.name + ' EXP', { node: ident, property: 'name' });
    //                         });

    //                         cexp.lv.forEach(clv=>{
    //                             accept('error', 'cexp.lv', { node: clv, property: 'idents' });
    //                             clv.idents.forEach(ident =>{
    //                                 accept('error', 'clv.ident', { node: ident, property: 'name' });
    //                                 // if (!this.IdentsTable.get(func.func).has(ident.name)){
    //                                 //     accept('error', ident.name + ' is not declared.', { node: ident, property: 'name' });
    //                                 // }
    //                             })
    //                         });
    //                     });
    //                     d.const_init_val.const_init_val.forEach(cival => {
    //                         cival.const_exp.forEach(cexp => {
    //                             cexp.lv.forEach(clv=>{
    //                                 clv.idents.forEach(ident =>{
    //                                     accept('error', ident.name + ' is not declared.', { node: ident, property: 'name' });
    //                                     // if (!this.IdentsTable.get(func.func).has(ident.name)){
    //                                     //     accept('error', ident.name + ' is not declared.', { node: ident, property: 'name' });
    //                                     // }
    //                                 })
    //                             });
    //                         });
    //                     });
    //                 });
    //             } else if(de.decls_spc.$type == "VarDecl"){
    //                 // (de.decls_spc as VarDecl).var_def.forEach(d => {
    //                 //     const str: string = d.idents.name;
    //                 //     if (!this.checkIdent(str)) {
    //                 //         accept('error', 'Idents should be started with _ a-z A-Z.' + str + String(this.checkIdent(str)), { node: d, property: 'idents' });
    //                 //     }
    //                 // });
    //             }
    //         });
    //     });
    // }

    checkExp(exp: Exp, accept: ValidationAcceptor): void {
        const num = exp.numint;
        if (typeof num === 'number') {
            if (!this.checkNum(num)) {
                accept('warning', 'Int overflow.', { node: exp, property: 'numint' });
            }
        }
        // exp.idents.forEach(ident =>{
        //     accept('warning', ident.name + ' EXP', { node: exp, property: 'idents' });
        // });
        // exp.lv.forEach(el=>{
        //     accept('warning', 'ExpLVal', { node: el, property: 'idents' });
        //     el.idents.forEach(eid=>{
        //         accept('warning', 'ExpLValIdent', { node: eid, property: 'name' });
        //     })
        // });
        // exp.exps.forEach(e => {
        //     accept('warning', 'ExpExp', { node: e, property: 'idents' });
        //     e.idents.forEach(ident =>{
        //         accept('warning', ident.name + ' ExpExp', { node: ident, property: 'name' });
        //     //     if (myIdents.has(ident.name)){
        //     //         accept('error', 'Ident is not declared.', { node: ident, property: 'name' });
        //     // }

        //     });
        // });
    }

    checkLVal(lval: LVal, accept: ValidationAcceptor): void {
        lval.idents.forEach(ident =>{
            // accept('warning', ident.name + ' is not declared.', { node: ident, property: 'name' });
            // if (!this.IdentsTable.get('global').has(ident.name)){
            if (!this.IdentsTable.match(ident.name,'global')){
                accept('error', ident.name + ' is not declared.', { node: ident, property: 'name' });
            }
        })
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
