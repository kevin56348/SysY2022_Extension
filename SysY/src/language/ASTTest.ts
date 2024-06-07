import { parseHelper } from "langium/test";
import { ConstDecl, Exp, Model, VarDecl } from "../language/generated/ast.js";
import { EmptyFileSystem } from "langium";
import {createSysYServices} from "./sys-y-module.js"
import { integer } from "vscode-languageclient";
import { Position } from "vscode";

export async function getAstModel(doc: string) : Promise<[string, Position][]>{
    const services = createSysYServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.SysY);

    const document = await parse(doc);

    const model = document.parseResult.value;

    console.log(model);

    const finddef = new Defs;

    var vardefs: Array<[string, Position]>;

    vardefs = finddef.getAllDefs(model);

    return vardefs;
}

export class Defs {
    getAllDefs(model: Model) {
        var vardefs: Array<[string, Position]> = [];

        console.log("Entering getFuncDefs");
        if (!model) {
            return vardefs;
        }
    
        const decls = model.decls;
        const decl_len = decls.length;
    
        // console.log(decl_len);
    
        if (decl_len == 0) {
            console.log("NO decls");
            return vardefs;
        }
    
        console.log("Found decls");
    
        const expcalc = new ExpCalc;
    
        decls.forEach(declspc => {
            // console.log(declspc);
            if (declspc.decls_spc.$type == ConstDecl) {
                console.log("Found a const decl:");
                const declnames = declspc.decls_spc.const_def;
                declnames.forEach(decl => {
                    console.log("Ident: %s", decl.idents.name);
                    if (decl.idents.$cstNode?.range) {
                        console.log(decl.idents.$cstNode?.range);
                        vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character) ])
                    }
                    var initial_vals = decl.const_init_val;
                    if (initial_vals.const_exp) {
                        const calc_val = expcalc.calc(initial_vals.const_exp);
                        calc_val.forEach(val => {
                            console.log("calced a val of %s : %d", decl.idents.name, val);
                        });
                    }
                });
            } else if (declspc.decls_spc.$type == VarDecl) {
                console.log("Found a var decl:");
                const declnames = declspc.decls_spc.var_def;
                declnames.forEach(decl => {
                    console.log("Ident: %s", decl.idents.name);
                    if (decl.idents.$cstNode?.range) {
                        console.log(decl.idents.$cstNode?.range);
                        vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character) ])
                    }
                    var initial_vals = decl.init_val;
                    if (initial_vals?.exps) {
                        const calc_val = expcalc.calc(initial_vals.exps);
                        calc_val.forEach(val => {
                            console.log("calced a val of %s : %d", decl.idents.name, val);
                        });
                    }
                });
            }
            
        });


        return vardefs;
    }
}

class ExpCalc{
    vals: Array<integer> = [];
    
    calc(exp: Exp): Array<integer> {
        this.vals = [];
        return this.getExpVal(exp);
    }

    getExpVal(exp: Exp) : Array<integer> {
        // console.log("cacl exp...");
        // console.log("type %s", exp.$type);

        if (exp.numint != undefined) {
            // console.log("Found a exp = %d", exp.numint);
            this.vals.push(exp.numint);
            return [];
        }

        const exps = exp.exps;
        exps.forEach(exp_ => {
            this.getExpVal(exp_);
        });

        return this.vals; 

    }
}
