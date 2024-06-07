import { parseHelper } from "langium/test";
import { ConstDecl, Exp, Model } from "../language/generated/ast.js";
import { EmptyFileSystem } from "langium";
import {createSysYServices} from "./sys-y-module.js"
import { integer } from "vscode-languageclient";

export async function getAstModel() {
    const services = createSysYServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.SysY);

    const document = await parse(`
        int yyy = 0;
        const int kl = 110, kk = 120;

        int main(){
            int y = 0;
        }
        `);

    const model = document.parseResult.value;

    console.log(model);

    getAllDefs(model);
}

export function getAllDefs(model: Model) {
    console.log("Entering getFuncDefs");
    if (!model) {
        return;
    }

    const decls = model.decls;
    const decl_len = decls.length;

    // console.log(decl_len);

    if (decl_len == 0) {
        console.log("NO decls");
        return;
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
                var initial_vals = decl.const_init_val;
                if (initial_vals.const_exp) {
                    const calc_val = expcalc.calc(initial_vals.const_exp);
                    calc_val.forEach(val => {
                        console.log("calced a val of %s : %d", decl.idents.name, val);
                    });
                }
            });
        }
        
    });
}

class ExpCalc{
    vals: Array<integer> = [];
    
    calc(exp: Exp): Array<integer> {
        this.vals = [];
        return this.getExpVal(exp);
    }

    getExpVal(exp: Exp) : Array<integer> {
        console.log("cacl exp...");
        console.log("type %s", exp.$type);

        if (exp.numint != undefined) {
            console.log("Found a exp = %d", exp.numint);
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
