import * as vscode from 'vscode';
import {IdentTable} from "./IdentTable.js";


let regexDeclRest = /(\[\d*\]){0,2}\s*=.*;/g;
let regexConstDecl = /^\s*const\s*int\s*/g;
let regexVarDecl = /^\s*int\s*/g;
let regexFuncDecl = /^\s*(int|void)\s*[a-zA-Z_][a-zA-Z_0-9]*\s*\(.*/g;
let regexFuncDeclFirst = /^\s*(int|void)\s*/g;
let regexFuncDeclLast = /\s*\(.*/g;
let regexParams = /int\s*[a-zA-Z_][a-zA-Z_0-9]*/g;

export function creatIdentTable() { 
    let document: vscode.TextDocument;
    const editor = vscode.window.activeTextEditor;
    let itable = new IdentTable();
    if (editor) {
        console.log("~~~~~~~");
        document = editor.document;
        let tmp_level = 0;
        let tmp_func_name = "global"
        for (let index = 0; index < document.lineCount; index++) {
            const element = document.lineAt(index).text;
            if(/{/.test(element)){
                tmp_level = tmp_level + 1;
            }
            if (/int\s*main\s*\(/.test(element)){
                tmp_level = 1;
            }
            else if(regexFuncDecl.test(element)) {
                var funcdecl_head = element.replace(regexFuncDeclLast, "");
                var func_type = funcdecl_head.match(/(int|void)/);
                var func_name = funcdecl_head.replace(regexFuncDeclFirst, "");
                var funcdecl_body = element.match(/\(.*?\)/);
                var func_param;
                if (funcdecl_body != null){
                    func_param = funcdecl_body[0].match(regexParams);
                    itable.add(func_name, index + 1, 0, func_name, (func_type != null ? func_type[0] : ''), func_param?.length);
                }
                else{
                    itable.add(func_name, index + 1, 0, func_name, (func_type != null ? func_type[0] : ''));
                }
                func_param?.forEach(fp=>{
                    var param_name = fp.replace(regexVarDecl, "");
                    itable.add(param_name, index + 1, 1, func_name, "int");
                });
                tmp_func_name = func_name;
            } else if (regexConstDecl.test(element) && regexDeclRest.test(element)) {
                var id_name = element.replace(regexConstDecl, "");
                id_name.replace(regexDeclRest, "");
                itable.add(id_name, index + 1, tmp_level, tmp_func_name);
            } else if (regexVarDecl.test(element) && regexDeclRest.test(element)) {
                var id_name = element.replace(regexVarDecl, "");
                id_name.replace(regexDeclRest, "");
                itable.add(id_name, index + 1, tmp_level, tmp_func_name);
            }  
            if(/}/.test(element)){
                tmp_level = tmp_level - 1;
                if (tmp_level == 0){
                    tmp_func_name = "global";
                }
            }
        }
        console.log(itable);
    }
    return itable;
};