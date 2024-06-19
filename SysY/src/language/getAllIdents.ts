import { isModel, Block, ConstDecl, Exp, Model, Stmt, VarDecl, ConstInitVal, InitVal } from "./generated/ast.js";
import { AstNode } from "langium";
import { Position, Range } from "vscode";
import * as vscode from "vscode";

export async function getAstModel(model: AstNode) : Promise<[string, Position, number, string, Range][]>{
    const td = vscode.workspace.textDocuments;

    var doc: string = "";

    td.forEach(t => {
        doc += t.getText();
        // //console.log(doc);
    });


    const finddef = new Idents;

    var vardefs: Array<[string, Position, number, string, Range]>;
    
    if (!isModel(model)) {
        throw new Error('');
    }
    //console.log(model);
    vardefs = finddef.getAllIdents(model);

    return vardefs;
}

export class Idents {
    expcalc = new ExpCalc;
    vardefs: Array<[string, Position, number, string, Range]> = [];

    getAllIdents(model: Model) {
        this.vardefs = [];
        //console.log("Entering getFuncDefs");
    
        const decls = model.decls;
        const decl_len = decls.length;
    
        // //console.log(decl_len);
    
        if (decl_len == 0) {
            //console.log("NO decls");
            // return this.vardefs;
        }
    
        //console.log("Found decls");
    
        var lv: number = 0;
        // global
    
        decls.forEach(declspc => {
            // //console.log(declspc);
            if (declspc.decls_spc.$type == ConstDecl) {
                //console.log("Found a const decl:");
                const declnames = declspc.decls_spc.const_def;
                declnames.forEach(decl => {
                    // //console.log("Ident: %s", decl.idents.name);
                    // if (decl.idents.$cstNode?.range) {
                    //     //console.log(decl.idents.$cstNode?.range);
                    //     if(model.$cstNode?.range){
                    //         this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, "", 
                    //             new Range(decl.idents.$cstNode.range.start as Position, model.$cstNode?.range.end as Position)])
                    //             //console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                    //                 decl.idents.name,
                    //                 decl.idents.$cstNode.range.start.line,
                    //                 decl.idents.$cstNode.range.start.character,
                    //                 model.$cstNode?.range.end.line,
                    //                 model.$cstNode?.range.end.character
                    //             );
                    //     }
                    // }
                    var const_exps = decl.const_exp;
                    if (const_exps){
                        const_exps.forEach(const_exp => {
                            this.traverse_exp(const_exp, lv, "");
                        });
                    }
                    var initial_vals = decl.const_init_val;
                    if (initial_vals.const_exp) {
                        this.traverse_exp(initial_vals.const_exp, lv, "");
                    }
                    else if (initial_vals.const_init_val){
                        initial_vals.const_init_val.forEach(const_init_val => {
                            this.traverse_const_init_val(const_init_val, lv, "");   
                        });
                    }
                });
            } else if (declspc.decls_spc.$type == VarDecl) {
                //console.log("Found a var decl:");
                const declnames = declspc.decls_spc.var_def;
                declnames.forEach(decl => {
                    // //console.log("Ident: %s", decl.idents.name);
                    // if (decl.idents.$cstNode?.range) {
                    //     //console.log(decl.idents.$cstNode?.range);
                    //     if (model.$cstNode?.range) {
                    //         this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, "",
                    //             new Range(decl.idents.$cstNode.range.start as Position, model.$cstNode?.range.end as Position)])
                    //             //console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                    //                 decl.idents.name,
                    //                 decl.idents.$cstNode.range.start.line,
                    //                 decl.idents.$cstNode.range.start.character,
                    //                 model.$cstNode?.range.end.line,
                    //                 model.$cstNode?.range.end.character
                    //             );
                    //     }
                    // }
                    var const_exps = decl.const_exp;
                    if (const_exps){
                        const_exps.forEach(const_exp => {
                            this.traverse_exp(const_exp, lv, "");
                        });
                    }
                    var initial_vals = decl.init_val;
                    if (initial_vals) {
                        if (initial_vals.exps) {
                            this.traverse_exp(initial_vals.exps, lv, "");
                        }
                        else if (initial_vals.init_vals){
                            initial_vals.init_vals.forEach(init_val => {
                                this.traverse_init_val(init_val, lv, "");   
                            });
                        }
                    }
                });
            }
            
        });

        const funcdefs = model.funcdefs;

        // funcs, lv+1
        lv += 1;
        funcdefs.forEach(funcdef => {
            if (funcdef.funcfps) {
                funcdef.funcfps.funcfp.forEach(fp => {
                    if (fp.const_exp){
                        fp.const_exp.forEach(cexp=>{
                            this.traverse_exp(cexp, lv, funcdef.func);
                        });
                    }
                    // //console.log(fp.ident.name);
                    // if (fp.ident.$cstNode?.range) {
                    //     //console.log(fp.ident.$cstNode?.range);
                    //     //console.log(funcdef.func);
                    //     this.vardefs.push([fp.ident.name, new Position(fp.ident.$cstNode.range.start.line, fp.ident.$cstNode.range.start.character), lv, funcdef.func,
                    //         new Range(fp.ident.$cstNode.range.start as Position, funcdef.$cstNode?.range.end as Position)])
                    //         //console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                    //             fp.ident.name,
                    //             fp.ident.$cstNode.range.start.line,
                    //             fp.ident.$cstNode.range.start.character,
                    //             funcdef.$cstNode?.range.end.line,
                    //             funcdef.$cstNode?.range.end.character
                    //         );
                    // }
                });
            }

            if (funcdef.blks) {
                // inside funcdef
                this.traverse_blk(funcdef.blks, lv, funcdef.func);
            }
            

        });


        // lv == 1 in mainfunc
        
        const mainfuncdef = model.mainfuncdef;
        this.traverse_blk(mainfuncdef.blks, lv, "main");

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
        if (stmt.exp){
            this.traverse_exp(stmt.exp, lv, func);
        }
        if (stmt.exps){
            stmt.exps.forEach(sexp => {
                this.traverse_exp(sexp, lv, func);
            });
        }
        if (stmt.lv){
            if (stmt.lv.idents.$cstNode?.range) {
                //console.log(stmt.lv.idents.$cstNode?.range);
                if (stmt.$cstNode?.range){
                    this.vardefs.push([stmt.lv.idents.name, new Position(stmt.lv.idents.$cstNode.range.start.line, stmt.lv.idents.$cstNode.range.start.character), lv, func,
                        new Range(stmt.lv.idents.$cstNode.range.start as Position, stmt.$cstNode?.range.end as Position)]);
                }
            }
        }
    }

    traverse_blk(blks: Block, lv: number, func: string) {
        blks.bis.forEach(fp => {
            if (fp.decls) {
                if (fp.decls.decls_spc.$type == ConstDecl){
                    //console.log("Found a const decl:");
                    const declnames = fp.decls.decls_spc.const_def;
                    declnames.forEach(decl => {
                        // //console.log("Ident: %s", decl.idents.name);
                        // if (decl.idents.$cstNode?.range) {
                        //     //console.log(decl.idents.$cstNode?.range);
                        //     if(blks.$cstNode?.range){
                        //         this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, func,
                        //             new Range(decl.idents.$cstNode.range.start as Position, blks.$cstNode?.range.end as Position)]);
                        //             //console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                        //                 decl.idents.name,
                        //                 decl.idents.$cstNode.range.start.line,
                        //                 decl.idents.$cstNode.range.start.character,
                        //                 blks.$cstNode?.range.end.line,
                        //                 blks.$cstNode?.range.end.character
                        //             );
                        //     }
                        // }
                        // var initial_vals = decl.const_init_val;
                        // if (initial_vals.const_exp) {
                        //     const calc_val = this.expcalc.calc(initial_vals.const_exp);
                        //     calc_val.forEach(val => {
                        //         //console.log("calced a val of %s : %d", decl.idents.name, val);
                        //     });
                        // }
                        var const_exps = decl.const_exp;
                        if (const_exps){
                            const_exps.forEach(const_exp => {
                                this.traverse_exp(const_exp, lv, "");
                            });
                        }
                        var initial_vals = decl.const_init_val;
                        if (initial_vals.const_exp) {
                            this.traverse_exp(initial_vals.const_exp, lv, "");
                        }
                        else if (initial_vals.const_init_val){
                            initial_vals.const_init_val.forEach(const_init_val => {
                                this.traverse_const_init_val(const_init_val, lv, "");   
                            });
                        }
                    });
                }else if (fp.decls.decls_spc.$type == VarDecl) {
                    //console.log("Found a var decl:");
                    const declnames = fp.decls.decls_spc.var_def;
                    declnames.forEach(decl => {
                        // //console.log("Ident: %s", decl.idents.name);
                        // if (decl.idents.$cstNode?.range) {
                        //     //console.log(decl.idents.$cstNode?.range);
                        //     if (blks.$cstNode?.range) {
                        //         this.vardefs.push([decl.idents.name, new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character), lv, func, 
                        //             new Range(decl.idents.$cstNode.range.start as Position, blks.$cstNode?.range.end as Position)]);
                        //         //console.log("%s begins at line: %d, character: %d; ends at line: %d, character: %d",
                        //             decl.idents.name,
                        //             decl.idents.$cstNode.range.start.line,
                        //             decl.idents.$cstNode.range.start.character,
                        //             blks.$cstNode?.range.end.line,
                        //             blks.$cstNode?.range.end.character
                        //         );
                        //     }
                        // }
                        // var initial_vals = decl.init_val;
                        // if (initial_vals?.exps) {
                        //     const calc_val = this.expcalc.calc(initial_vals.exps);
                        //     calc_val.forEach(val => {
                        //         //console.log("calced a val of %s : %d", decl.idents.name, val);
                        //     });
                        // }
                        var const_exps = decl.const_exp;
                        if (const_exps){
                            const_exps.forEach(const_exp => {
                                this.traverse_exp(const_exp, lv, "");
                            });
                        }
                        var initial_vals = decl.init_val;
                        if (initial_vals) {
                            if (initial_vals.exps) {
                                this.traverse_exp(initial_vals.exps, lv, "");
                            }
                            else if (initial_vals.init_vals){
                                initial_vals.init_vals.forEach(init_val => {
                                    this.traverse_init_val(init_val, lv, "");   
                                });
                            }
                        }
                    });
                }
            } 

            if (fp.stmts) {
                this.traverse_stmt(fp.stmts, lv + 1, func);
            }

        });
    }

    traverse_exp (exps: Exp, lv: number, func: string) {
        if (exps.exps){
            exps.exps.forEach(eexp => {
                this.traverse_exp(eexp, lv, func);
            });
        }
        if (exps.lv){
            exps.lv.forEach(elv => {
                //console.log("Ident: %s", elv.idents.name);
                if (elv.idents.$cstNode?.range) {
                    //console.log(elv.idents.$cstNode?.range);
                    if (exps.$cstNode?.range){
                        this.vardefs.push([elv.idents.name, new Position(elv.idents.$cstNode.range.start.line, elv.idents.$cstNode.range.start.character), lv, func,
                            new Range(elv.idents.$cstNode.range.start as Position, exps.$cstNode?.range.end as Position)]);
                    }
                }
            });
        }
    }

    traverse_const_init_val (const_init_vals: ConstInitVal, lv: number, func: string) {
        if (const_init_vals.const_exp){
            this.traverse_exp(const_init_vals.const_exp, lv, func);
        }
        else if (const_init_vals.const_init_val){
            const_init_vals.const_init_val.forEach(civ=>{
                this.traverse_const_init_val(civ, lv, func);
            });
        }
    }

    traverse_init_val (init_vals: InitVal, lv: number, func: string) {
        if (init_vals.exps){
            this.traverse_exp(init_vals.exps, lv, func);
        }
        else if (init_vals.init_vals){
            init_vals.init_vals.forEach(iv=>{
                this.traverse_init_val(iv, lv, func);
            });
        }
    }
}



class ExpCalc{
    vals: Array<number> = [];
    
    calc(exp: Exp): Array<number> {
        this.vals = [];
        return this.getExpVal(exp);
    }

    getExpVal(exp: Exp) : Array<number> {
        // //console.log("cacl exp...");
        // //console.log("type %s", exp.$type);

        if (exp.numint != undefined) {
            // //console.log("Found a exp = %d", exp.numint);
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
