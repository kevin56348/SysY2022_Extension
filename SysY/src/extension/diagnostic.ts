// TODO:
// IdentTable初始化/赋值之后为Array(0),再次调用才为正常Array(length)
// 关闭工作区，错误信息不能清除
import * as vscode from 'vscode';
import * as ast from "../language/ASTTest.js"
import { IdentTable } from "../utils/IdentTable.js";

export class IdentDiagnostic {
    diagnostics: vscode.DiagnosticCollection;

    declsTable: IdentTable;
    varsTable: IdentTable;

    constructor() {
        this.diagnostics = vscode.languages.createDiagnosticCollection('sys-y');
        this.declsTable = new IdentTable();
        this.varsTable = new IdentTable();

        this.findAllConstDecls();
        this.findAllIdents();
    }

    public updateDiagnostics(
        document: vscode.TextDocument
    ){
        console.log("~~~~~~~~diagnostic-23");
        // this.diagnostics = vscode.languages.createDiagnosticCollection('sys-y');
        // this.findAllConstDecls();
        // this.findAllIdents();

        const diagnosticsArray: vscode.Diagnostic[] = [];

        this.varsTable.getnode().forEach(node => {
            console.log("~~~" + node.name + ":" + this.declsTable.match(node));
            if (!this.declsTable.match(node)){
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(node.position, new vscode.Position(node.position.line, node.position.character + node.name.length)),
                    node.name + ' was not declared in this scope.',
                    vscode.DiagnosticSeverity.Error
                );
                diagnosticsArray.push(diagnostic);
            }
        });

        this.diagnostics.set(document.uri, diagnosticsArray);
        console.log("~~~~~~~~diagnostic-43");
        console.log(this.declsTable);
        console.log(this.varsTable);
        console.log(diagnosticsArray);
    }

    public clearDiagnostics(
        document: vscode.TextDocument
    ){
        this.diagnostics.delete(document.uri);
    }

    public updateTable(){
        this.findAllConstDecls();
        this.findAllIdents();
    }

    findAllConstDecls(){ 
        var vardefs = ast.getAstModel();

        this.declsTable.add_arrs(vardefs);
        // vardefs.then(
        //     res => {
        //         // console.log(res);
        //         res.forEach(r => {
        //             this.declsTable.add_arr(r);
        //         });
                
        //     }
        // )
    }

    findAllIdents(){ 
        var varidents = ast.getAstModel_Ident();
        let tmp = this.varsTable.add_arrs(varidents);
        console.log(tmp);
        // this.varsTable.add_arrs(varidents);
        // varidents.then(
        //     res => {
        //         // console.log(res);
        //         res.forEach(r => {
        //             this.varsTable.add_arr(r);
        //         });
                
        //     }
        // )
    }

}