import { parseHelper } from "langium/test";
import { Block, ConstDecl, Exp, Model, Stmt, VarDecl, ConstInitVal, InitVal, Decl } from "../language/generated/ast.js";
import { EmptyFileSystem } from "langium";
import {createSysYServices} from "./sys-y-module.js"
import { Position, Range } from "vscode";
import * as vscode from "vscode";
// import { isUnionType } from "langium/grammar";
// import { CompletionItemLabelDetails } from "vscode-languageclient";

export interface DefsInside {
    ident: string;
    pos: Position;
    lv: number;
    belong_to: string;
    range: Range;
    type?: string;
    funcfparam?: string[];
    unused: boolean;
}

export async function getAstModel() : Promise<DefsInside[]>{
    const services = createSysYServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.SysY);
    var vardefs: Array<DefsInside> = [];
    var doc: string = "";
    const td = vscode.window.activeTextEditor?.document;

    if (td) {
        doc = td.getText();
    }

    const document = await parse(doc);

    const model = document.parseResult.value;

    console.log(model);

    const finddef = new Defs;


    vardefs = finddef.getAllDefs(model);

    return vardefs;
}

export async function getAstModel_Ident() : Promise<[string, Position, number, string, Range, string, string[] | undefined, boolean | undefined][]>{
    const services = createSysYServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.SysY);
    var varidents: Array<[string, Position, number, string, Range, string, string[] | undefined, boolean | undefined]> = [];
    const td = vscode.window.activeTextEditor?.document;
    var doc: string = "";

    if (td) {
        doc = td.getText();
    }
    

    const document = await parse(doc);

    const model = document.parseResult.value;

    //console.log(model);

    const finddef = new Idents;

    varidents = finddef.getAllIdents(model);

    return varidents;
}

export class Defs {
    expcalc = new ExpCalc;
    vardefs: Array<DefsInside> = [];

    getAllDefs(model: Model) {
        this.vardefs = [];
        // console.log("Entering getFuncDefs");
        if (!model) {
            return this.vardefs;
        }
    
        const decls = model.decls;
        const decl_len = decls.length;
        // const funcd = model.funcdefs;
    
    
        if (decl_len == 0) {
            // console.log("NO decls");
            // return this.vardefs;
        }
    
        // console.log("Found decls");
    
        var lv: number = 0;
        // global

        // funcd.forEach(func => { 
        //     if (func.$cstNode?.range) {
        //         const fps = func.funcfps;
        //         if (fps) {
        //             var fpts: string[] = [];
        //             fps.funcfp.forEach(f => {
        //                 fpts.push(f.vartype.mytype.toString());
        //             });
        //             // console.log(fpts);
        //             var di = <DefsInside>{
        //                 ident: func.func.toString(),
        //                 pos: new Position(func.$cstNode?.range.start.line, func.$cstNode?.range.start.character),
        //                 lv: lv,
        //                 belong_to: "",
        //                 range: new Range(func.$cstNode.range.start as Position, model.$cstNode?.range.end as Position),
        //                 type: func.functype.mytype.toString(),
        //                 funcfparam: fpts
        //             };
        //             this.vardefs.push(di);
        //         } else {
        //             var di = <DefsInside>{
        //                 ident: func.func.toString(),
        //                 pos: new Position(func.$cstNode?.range.start.line, func.$cstNode?.range.start.character),
        //                 lv: lv,
        //                 belong_to: "",
        //                 range: new Range(func.$cstNode.range.start as Position, model.$cstNode?.range.end as Position),
        //                 type: func.functype.mytype.toString(),
        //                 funcfparam: ["void"]
        //             };
        //             this.vardefs.push(di);
        //         }

        //     }
        // });
    
        decls.forEach(declspc => {
            // //console.log(declspc);
            if (declspc.decls_spc.$type == ConstDecl) {
                // console.log("Found a const decl:");
                const declnames = declspc.decls_spc.const_def;
                declnames.forEach(decl => {
                    // console.log("Ident: %s", decl.idents.name);
                    if (decl.idents.$cstNode?.range) {
                        // console.log(decl.idents.$cstNode?.range);
                        if (model.$cstNode?.range) {
                            var di = <DefsInside>{
                                ident: decl.idents.name,
                                pos: new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character),
                                lv: lv,
                                belong_to: "",
                                range: new Range(decl.idents.$cstNode.range.start as Position, model.$cstNode?.range.end as Position),
                                type: declspc.decls_spc.vartype.mytype.toString(),
                                unused: false
                            };
                            this.vardefs.push(di);
                        }
                    }
                    var initial_vals = decl.const_init_val;
                    if (initial_vals.const_exp) {
                        const calc_val = this.expcalc.calc(initial_vals.const_exp);
                        calc_val.forEach(val => {
                            // console.log("calced a val of %s : %d", decl.idents.name, val);
                        });
                    }
                });
            } else if (declspc.decls_spc.$type == VarDecl) {
                // console.log("Found a var decl:");
                const declnames = declspc.decls_spc.var_def;
                declnames.forEach(decl => {
                    // console.log("Ident: %s", decl.idents.name);
                    if (decl.idents.$cstNode?.range) {
                        // console.log(decl.idents.$cstNode?.range);
                        if (model.$cstNode?.range) {
                            var di = <DefsInside>{
                                ident: decl.idents.name,
                                pos: new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character),
                                lv: lv,
                                belong_to: "",
                                range: new Range(decl.idents.$cstNode.range.start as Position, model.$cstNode?.range.end as Position),
                                type: declspc.decls_spc.vartype.mytype.toString(),
                                unused: false
                            };
                            this.vardefs.push(di);
                        }
                    }
                    var initial_vals = decl.init_val;
                    if (initial_vals?.exps) {
                        const calc_val = this.expcalc.calc(initial_vals.exps);
                        calc_val.forEach(val => {
                            // console.log("calced a val of %s : %d", decl.idents.name, val);
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
                // console.warn("123123123123123");                // add params into defs
                var fps: string[] = [];
                funcdef.funcfps.funcfp.forEach(f => {
                    fps.push(f.vartype.mytype.toString());
                });
                
                funcdef.funcfps.funcfp.forEach(fp => {
                    // console.log(fp.ident.name);
                    if (fp.ident.$cstNode?.range) {
                        var di = <DefsInside>{
                            ident: fp.ident.name,
                            pos: new Position(fp.ident.$cstNode.range.start.line, fp.ident.$cstNode.range.start.character),
                            lv: 1,
                            belong_to: funcdef.func,
                            range: new Range(fp.ident.$cstNode.range.start as Position, funcdef.$cstNode?.range.end as Position),
                            type: fp.vartype.mytype,
                            unused: false
                        };
                        this.vardefs.push(di);
                }
                });

                if(funcdef.$cstNode){
                    var di = <DefsInside>{
                        ident: funcdef.func,
                        pos: new Position(funcdef.$cstNode.range.start.line, funcdef.$cstNode.range.start.character),
                        lv: 0,
                        belong_to: "",
                        range: new Range(funcdef.$cstNode.range.start as Position, model.$cstNode?.range.end as Position),
                        type: funcdef.functype.mytype,
                        funcfparam: fps,
                        unused: false
                    };
                    this.vardefs.push(di);
                    console.log("Added func: ", funcdef.func, " whose params are ", fps);
                }
                
            } else {
                if(funcdef.$cstNode){
                    var di = <DefsInside>{
                        ident: funcdef.func,
                        pos: new Position(funcdef.$cstNode.range.start.line, funcdef.$cstNode.range.start.character),
                        lv: 0,
                        belong_to: "",
                        range: new Range(funcdef.$cstNode.range.start as Position, model.$cstNode?.range.end as Position),
                        type: funcdef.functype.mytype,
                        funcfparam: [],
                        unused: false
                    };
                    this.vardefs.push(di);
                    console.log("Added func: ", funcdef.func, " whose params are ", "void");
                }
            }

            if (funcdef.blks) {
                // inside funcdef
                this.traverse_blk(funcdef.blks, lv, funcdef.func, false);
            }
            

        });


        // lv == 1 in mainfunc
        
        const mainfuncdef = model.mainfuncdef;
        this.traverse_blk(mainfuncdef.blks, lv, "main", false);

        return this.vardefs;
    }

    traverse_stmt(stmt: Stmt, lv: number, func: string, is_unused: boolean) {
        var is_unused = false;
        if (stmt.blks) {
            this.traverse_blk(stmt.blks, lv , func, is_unused);
        }
        if (stmt.stmts) {
            if (stmt.b || stmt.c ) {
                is_unused = true;
            }

            stmt.stmts.forEach(st => {
                if (st.blks) {
                    this.traverse_blk(st.blks, lv, func, is_unused );
                }
                if (st.stmts) {
                    st.stmts.forEach(b => {
                        if (b.b || b.c ) {
                            is_unused = true;
                        }
                        this.traverse_stmt(b, lv , func, is_unused);
                    });
                }

            });
        }
    }

    traverse_blk(blks: Block, lv: number, func: string, is_unused: boolean) {
        blks.bis.forEach(fp => {
            if (fp.decls) {
                if (fp.decls.decls_spc.$type == ConstDecl){
                    // console.log("Found a const decl:");
                    const declnames = fp.decls.decls_spc.const_def;
                    declnames.forEach(decl => {
                        // console.log("Ident: %s", decl.idents.name);
                        if (decl.idents.$cstNode?.range) {
                            // console.log(decl.idents.$cstNode?.range);
                            if(blks.$cstNode?.range){
                                var di = <DefsInside>{
                                    ident: decl.idents.name,
                                    pos: new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character),
                                    lv: lv,
                                    belong_to: func,
                                    range: new Range(decl.idents.$cstNode.range.start as Position, blks.$cstNode?.range.end as Position),
                                    type: (fp.decls as Decl).decls_spc.vartype.mytype.toString(),
                                    unused: is_unused
                                };
                                this.vardefs.push(di);
                            }
                        }
                        var initial_vals = decl.const_init_val;
                        if (initial_vals.const_exp) {
                            const calc_val = this.expcalc.calc(initial_vals.const_exp);
                            calc_val.forEach(val => {
                                // console.log("calced a val of %s : %d", decl.idents.name, val);
                            });
                        }
                    });
                }else if (fp.decls.decls_spc.$type == VarDecl) {
                    // console.log("Found a var decl:");
                    const declnames = fp.decls.decls_spc.var_def;
                    declnames.forEach(decl => {
                        // console.log("Ident: %s", decl.idents.name);
                        if (decl.idents.$cstNode?.range) {
                            // console.log(decl.idents.$cstNode?.range);
                            if (blks.$cstNode?.range) {
                                var di = <DefsInside>{
                                    ident: decl.idents.name,
                                    pos: new Position(decl.idents.$cstNode.range.start.line, decl.idents.$cstNode.range.start.character),
                                    lv: lv,
                                    belong_to: func,
                                    range: new Range(decl.idents.$cstNode.range.start as Position, blks.$cstNode?.range.end as Position),
                                    type: (fp.decls as Decl).decls_spc.vartype.mytype.toString(),
                                    unused: is_unused
                                };
                                this.vardefs.push(di);
                                    
                            }
                        }
                        var initial_vals = decl.init_val;
                        if (initial_vals?.exps) {
                            const calc_val = this.expcalc.calc(initial_vals.exps);
                            calc_val.forEach(val => {
                                // console.log("calced a val of %s : %d", decl.idents.name, val);
                            });
                        }
                    });
                }
            } 

            if (fp.stmts) {
                if (fp.stmts.c || fp.stmts.b ) {
                    is_unused = true;
                }
                this.traverse_stmt(fp.stmts, lv + 1, func, is_unused);
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

        if (exp.numint) {
            this.vals.push(exp.numint);
            return this.vals;
        }

        const exps = exp.exps;
        exps.forEach(exp_ => {
            this.getExpVal(exp_);
        });

        return this.vals; 
    }
}


export class Idents {
    expcalc = new ExpCalc;
    vardefs: Array<[string, Position, number, string, Range, string, string[] | undefined, boolean | undefined]> = [];

    getAllIdents(model: Model) {

        if (model.mainfuncdef) {
            console.log("ok");
        } else {
            console.warn("Main Func DOES NOT EXIST!");
        }

        this.vardefs = [];
        //console.log("Entering getFuncDefs");
    
        const decls = model.decls;
    
        var lv: number = 0;
        // global
    
        decls.forEach(declspc => {
            if (declspc.decls_spc.$type == ConstDecl) {
                //console.log("Found a const decl:");
                const declnames = declspc.decls_spc.const_def;
                declnames.forEach(decl => {
                    var const_exps = decl.const_exp;
                    if (const_exps){
                        const_exps.forEach(const_exp => {
                            this.traverse_exp(const_exp, lv, "", false);
                        });
                    }
                    var initial_vals = decl.const_init_val;
                    if (initial_vals.const_exp) {
                        this.traverse_exp(initial_vals.const_exp, lv, "", false);
                    }
                    else if (initial_vals.const_init_val){
                        initial_vals.const_init_val.forEach(const_init_val => {
                            this.traverse_const_init_val(const_init_val, lv, "", false);   
                        });
                    }
                });
            } else if (declspc.decls_spc.$type == VarDecl) {
                //console.log("Found a var decl:");
                const declnames = declspc.decls_spc.var_def;
                declnames.forEach(decl => {
                    var const_exps = decl.const_exp;
                    if (const_exps){
                        const_exps.forEach(const_exp => {
                            this.traverse_exp(const_exp, lv, "", false);
                        });
                    }
                    var initial_vals = decl.init_val;
                    if (initial_vals) {
                        if (initial_vals.exps) {
                            this.traverse_exp(initial_vals.exps, lv, "", false);
                        }
                        else if (initial_vals.init_vals){
                            initial_vals.init_vals.forEach(init_val => {
                                this.traverse_init_val(init_val, lv, "", false);   
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
                            this.traverse_exp(cexp, lv, funcdef.func, false);
                        });
                    }
                });
            }

            if (funcdef.blks) {
                // inside funcdef
                this.traverse_blk(funcdef.blks, lv, funcdef.func, false);
            }
            

        });


        // lv == 1 in mainfunc
        
        const mainfuncdef = model.mainfuncdef;
        if(mainfuncdef){
            this.traverse_blk(mainfuncdef.blks, lv, "main", false);
        }

        return this.vardefs;
    }

    traverse_stmt(stmt: Stmt, lv: number, func: string, is_unused: boolean) {
        if (stmt.blks) {
            this.traverse_blk(stmt.blks, lv , func, is_unused);
        }
        if(stmt.stmts){
            stmt.stmts.forEach(st => {
                if (st.blks) {
                    this.traverse_blk(st.blks, lv, func , is_unused);
                }
                if (st.stmts) {
                    st.stmts.forEach(b => {
                        this.traverse_stmt(b, lv , func,is_unused);
                    });
                }

            });
        }
        if (stmt.exp){
            this.traverse_exp(stmt.exp, lv, func, is_unused);
        }
        if (stmt.exps){
            stmt.exps.forEach(sexp => {
                this.traverse_exp(sexp, lv, func, is_unused);
            });
        }
        if (stmt.lv){
            if (stmt.lv.idents.$cstNode?.range) {
                //console.log(stmt.lv.idents.$cstNode?.range);
                if (stmt.$cstNode?.range){
                    this.vardefs.push([
                        stmt.lv.idents.name,
                        new Position(stmt.lv.idents.$cstNode.range.start.line, stmt.lv.idents.$cstNode.range.start.character),
                        lv,
                        func,
                        new Range(stmt.lv.idents.$cstNode.range.start as Position, stmt.$cstNode?.range.end as Position),
                        "void",
                        undefined,
                        is_unused
                    ]);
                }
            }
        }
        if (stmt.conds) {
            // ONLY ONE EXP EXISTS IN COND
            // console.warn(stmt.conds.exps.length);
            console.log(this.expcalc.calc(stmt.conds.exps[0]));
            this.traverse_exp(stmt.conds.exps[0], lv, func, is_unused);
        }
    }

    traverse_blk(blks: Block, lv: number, func: string, is_unused: boolean) {
        blks.bis.forEach(fp => {
            if (fp.decls) {
                if (fp.decls.decls_spc.$type == ConstDecl){
                    //console.log("Found a const decl:");
                    const declnames = fp.decls.decls_spc.const_def;
                    declnames.forEach(decl => {
                        var const_exps = decl.const_exp;
                        if (const_exps){
                            const_exps.forEach(const_exp => {
                                this.traverse_exp(const_exp, lv, "", is_unused);
                            });
                        }
                        var initial_vals = decl.const_init_val;
                        if (initial_vals.const_exp) {
                            this.traverse_exp(initial_vals.const_exp, lv, "", is_unused);
                        }
                        else if (initial_vals.const_init_val){
                            initial_vals.const_init_val.forEach(const_init_val => {
                                this.traverse_const_init_val(const_init_val, lv, "", is_unused);   
                            });
                        }
                    });
                }else if (fp.decls.decls_spc.$type == VarDecl) {
                    //console.log("Found a var decl:");
                    const declnames = fp.decls.decls_spc.var_def;
                    declnames.forEach(decl => {
                        var const_exps = decl.const_exp;
                        if (const_exps){
                            const_exps.forEach(const_exp => {
                                this.traverse_exp(const_exp, lv, "", is_unused);
                            });
                        }
                        var initial_vals = decl.init_val;
                        if (initial_vals) {
                            if (initial_vals.exps) {
                                this.traverse_exp(initial_vals.exps, lv, "", is_unused);
                            }
                            else if (initial_vals.init_vals){
                                initial_vals.init_vals.forEach(init_val => {
                                    this.traverse_init_val(init_val, lv, "", is_unused);   
                                });
                            }
                        }
                    });
                }
            } 

            if (fp.stmts) {
                if (fp.stmts.b || fp.stmts.c ) {
                    is_unused = true;
                }
                this.traverse_stmt(fp.stmts, lv + 1, func, is_unused);
            }

        });
    }

    traverse_exp (exps: Exp, lv: number, func: string, is_unused: boolean) {
        if (exps.exps){
            exps.exps.forEach(eexp => {
                this.traverse_exp(eexp, lv, func, is_unused);
            });
        }
        if (exps.lv){
            exps.lv.forEach(elv => {
                //console.log("Ident: %s", elv.idents.name);
                if (elv.idents.$cstNode?.range) {
                    //console.log(elv.idents.$cstNode?.range);
                    if (exps.$cstNode?.range){
                        this.vardefs.push([
                            elv.idents.name,
                            new Position(elv.idents.$cstNode.range.start.line, elv.idents.$cstNode.range.start.character),
                            lv,
                            func,
                            new Range(elv.idents.$cstNode.range.start as Position, exps.$cstNode?.range.end as Position),
                            "void",
                            undefined,
                            is_unused
                        ]);
                    }
                }
            });
        } 

        if (exps.idents) {
            // func call
            if (exps.idents.$cstNode?.range) {
                // console.log(exps.idents.name);
                if (exps.$cstNode?.range) {
                    const rps = exps.funrps;

                    var rpss: string[] = [];
                    if(rps){
                        rps.exps.forEach(rp => {
                            rpss.push("x");
                        });
                    }
                    this.vardefs.push([
                        exps.idents.name,
                        new Position(exps.idents.$cstNode.range.start.line, exps.idents.$cstNode.range.start.character),
                        lv,
                        func,
                        new Range(exps.idents.$cstNode.range.start as Position, exps.$cstNode?.range.end as Position),
                        "",
                        rpss,
                        is_unused
                    ]);
                    console.log("find func usage: ",exps.idents.name, rpss);
                }
            }
        }

    }

    traverse_const_init_val (const_init_vals: ConstInitVal, lv: number, func: string, is_unused: boolean) {
        if (const_init_vals.const_exp){
            this.traverse_exp(const_init_vals.const_exp, lv, func, is_unused);
        }
        else if (const_init_vals.const_init_val){
            const_init_vals.const_init_val.forEach(civ=>{
                this.traverse_const_init_val(civ, lv, func, is_unused);
            });
        }
    }

    traverse_init_val (init_vals: InitVal, lv: number, func: string, is_unused: boolean) {
        if (init_vals.exps){
            this.traverse_exp(init_vals.exps, lv, func, is_unused);
        }
        else if (init_vals.init_vals){
            init_vals.init_vals.forEach(iv=>{
                this.traverse_init_val(iv, lv, func, is_unused);
            });
        }
    }
}