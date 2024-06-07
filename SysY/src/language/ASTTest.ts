import { parseHelper } from "langium/test";
import { Block, ConstDecl, Exp, Model, Stmt, VarDecl } from "../language/generated/ast.js";
import { EmptyFileSystem } from "langium";
import {createSysYServices} from "./sys-y-module.js"
import { Position, Range } from "vscode";

export async function getAstModel(doc: string) : Promise<[string, Position, number, string, Range][]>{
    const services = createSysYServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.SysY);

    const document = await parse(doc);

    const model = document.parseResult.value;

    console.log(model);

    const finddef = new Defs;

    var vardefs: Array<[string, Position, number, string, Range]>;

    vardefs = finddef.getAllDefs(model);

    return vardefs;
}

export class Defs {
    expcalc = new ExpCalc;
    vardefs: Array<[string, Position, number, string, Range]> = [];

    getAllDefs(model: Model) {
        this.vardefs = [];
        console.log("Entering getFuncDefs");
        if (!model) {
            return this.vardefs;
        }
    
        const decls = model.decls;
        const decl_len = decls.length;
    
        // console.log(decl_len);
    
        if (decl_len == 0) {
            console.log("NO decls");
            return this.vardefs;
        }
    
        console.log("Found decls");
    
        var lv: number = 0;
        // global
    
        decls.forEach(declspc => {
            // console.log(declspc);
            if (declspc.decls_spc.$type == ConstDecl) {
                console.log("Found a const decl:");
                const declnames = declspc.decls_spc.const_def;
                declnames.forEach(decl => {
                    console.log("Ident: %s", decl.idents.name);
                    if (decl.idents.$cstNode?.range) {
                        console.log(decl.idents.$cstNode?.range);
                        if(model.$cstNode?.range){
                            this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, "", 
                                new Range(decl.idents.$cstNode.range.start as Position, model.$cstNode?.range.end as Position)])
                                console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                                    decl.idents.name,
                                    decl.idents.$cstNode.range.start.line,
                                    decl.idents.$cstNode.range.start.character,
                                    model.$cstNode?.range.end.line,
                                    model.$cstNode?.range.end.character
                                );
                        }
                    }
                    var initial_vals = decl.const_init_val;
                    if (initial_vals.const_exp) {
                        const calc_val = this.expcalc.calc(initial_vals.const_exp);
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
                        if (model.$cstNode?.range) {
                            this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, "",
                                new Range(decl.idents.$cstNode.range.start as Position, model.$cstNode?.range.end as Position)])
                                console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                                    decl.idents.name,
                                    decl.idents.$cstNode.range.start.line,
                                    decl.idents.$cstNode.range.start.character,
                                    model.$cstNode?.range.end.line,
                                    model.$cstNode?.range.end.character
                                );
                        }
                    }
                    var initial_vals = decl.init_val;
                    if (initial_vals?.exps) {
                        const calc_val = this.expcalc.calc(initial_vals.exps);
                        calc_val.forEach(val => {
                            console.log("calced a val of %s : %d", decl.idents.name, val);
                        });
                    }
                });
            }
            
        });

        const funcdefs = model.funcdefs;

        // funcs, lv+1
        lv += 1;
        funcdefs.forEach(funcdef => {
            if (funcdef.funcfps) {
                // add params into defs
                funcdef.funcfps.funcfp.forEach(fp => {
                    console.log(fp.ident.name);
                    if (fp.ident.$cstNode?.range) {
                        console.log(fp.ident.$cstNode?.range);
                        console.log(funcdef.func);
                        this.vardefs.push([fp.ident.name, new Position(fp.ident.$cstNode.range.start.line, fp.ident.$cstNode.range.start.character), lv, funcdef.func,
                            new Range(fp.ident.$cstNode.range.start as Position, funcdef.$cstNode?.range.end as Position)])
                            console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                                fp.ident.name,
                                fp.ident.$cstNode.range.start.line,
                                fp.ident.$cstNode.range.start.character,
                                funcdef.$cstNode?.range.end.line,
                                funcdef.$cstNode?.range.end.character
                            );
                    }
                });
            }

            if (funcdef.blks) {
                // inside funcdef
                this.traverse_blk(funcdef.blks, lv, funcdef.func);
            }
            

        });


        return this.vardefs;
    }

    traverse_stmt(stmt: Stmt, lv: number, func: string) {
        if (stmt.blks) {
            this.traverse_blk(stmt.blks, lv , func);
        }
        if(stmt.stmts){
            stmt.stmts.forEach(st => {
                if (st.blks) {
                    this.traverse_blk(st.blks, lv, func );
                }
                if (st.stmts) {
                    st.stmts.forEach(b => {
                        this.traverse_stmt(b, lv , func);
                    });
                }

            });
        }
    }

    traverse_blk(blks: Block, lv: number, func: string) {
        blks.bis.forEach(fp => {
            if (fp.decls) {
                if (fp.decls.decls_spc.$type == ConstDecl){
                    console.log("Found a const decl:");
                    const declnames = fp.decls.decls_spc.const_def;
                    declnames.forEach(decl => {
                        console.log("Ident: %s", decl.idents.name);
                        if (decl.idents.$cstNode?.range) {
                            console.log(decl.idents.$cstNode?.range);
                            if(blks.$cstNode?.range){
                                this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, func,
                                    new Range(decl.idents.$cstNode.range.start as Position, blks.$cstNode?.range.end as Position)]);
                                    console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                                        decl.idents.name,
                                        decl.idents.$cstNode.range.start.line,
                                        decl.idents.$cstNode.range.start.character,
                                        blks.$cstNode?.range.end.line,
                                        blks.$cstNode?.range.end.character
                                    );
                            }
                        }
                        var initial_vals = decl.const_init_val;
                        if (initial_vals.const_exp) {
                            const calc_val = this.expcalc.calc(initial_vals.const_exp);
                            calc_val.forEach(val => {
                                console.log("calced a val of %s : %d", decl.idents.name, val);
                            });
                        }
                    });
                }else if (fp.decls.decls_spc.$type == VarDecl) {
                    console.log("Found a var decl:");
                    const declnames = fp.decls.decls_spc.var_def;
                    declnames.forEach(decl => {
                        console.log("Ident: %s", decl.idents.name);
                        if (decl.idents.$cstNode?.range) {
                            console.log(decl.idents.$cstNode?.range);
                            if (blks.$cstNode?.range) {
                                this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, func, 
                                    new Range(decl.idents.$cstNode.range.start as Position, blks.$cstNode?.range.end as Position)]);
                                console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                                    decl.idents.name,
                                    decl.idents.$cstNode.range.start.line,
                                    decl.idents.$cstNode.range.start.character,
                                    blks.$cstNode?.range.end.line,
                                    blks.$cstNode?.range.end.character
                                );
                            }
                        }
                        var initial_vals = decl.init_val;
                        if (initial_vals?.exps) {
                            const calc_val = this.expcalc.calc(initial_vals.exps);
                            calc_val.forEach(val => {
                                console.log("calced a val of %s : %d", decl.idents.name, val);
                            });
                        }
                    });
                }
            } 

            if (fp.stmts) {
                this.traverse_stmt(fp.stmts, lv + 1, func);
            }

        });
    }
}



class ExpCalc{
    vals: Array<number> = [];
    
    calc(exp: Exp): Array<number> {
        this.vals = [];
        return this.getExpVal(exp);
    }

    getExpVal(exp: Exp) : Array<number> {
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
