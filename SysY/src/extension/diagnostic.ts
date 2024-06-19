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
    }

    public async updateDiagnostics(
        document: vscode.TextDocument
    ) {
        this.diagnostics.clear();
        await this.findAllConstDecls();
        await this.findAllIdents();

        const diagnosticsArray: vscode.Diagnostic[] = [];

        this.declsTable.getnode().forEach(node => {
            if (!this.varsTable.unused(node)) {
                // find decl in var
                // not used here
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(node.position, new vscode.Position(node.position.line, node.position.character + node.name.length)),
                    'Unused var ' + node.name + ' in ' + node.func_name + ' at line ' + node.position.line,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnosticsArray.push(diagnostic);
            }
        });

        this.varsTable.getnode().forEach(node => {
            // console.log("~~~" + node.name + ":" + this.declsTable.match(node));
            if (node.unused) {
                if (node.unused as boolean) {
                    const diagnostic = new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(node.position.line, 0), new vscode.Position(node.position.line, node.position.character + node.name.length + 200)),
                        'dead code.',
                        vscode.DiagnosticSeverity.Information
                    );
                    diagnosticsArray.push(diagnostic);
                }
            } else {
                if (!this.declsTable.match(node)) {
                    if (node.funcfparam === undefined) {
                        const diagnostic = new vscode.Diagnostic(
                            new vscode.Range(node.position, new vscode.Position(node.position.line, node.position.character + node.name.length)),
                            node.name + ' was not declared in this scope.',
                            vscode.DiagnosticSeverity.Error
                        );
                        diagnosticsArray.push(diagnostic);
                    } else {
                        const diagnostic = new vscode.Diagnostic(
                            new vscode.Range(node.position, new vscode.Position(node.position.line, node.position.character + node.name.length)),
                            'Function ' + node.name + ' was not declared.',
                            vscode.DiagnosticSeverity.Error
                        );
                        diagnosticsArray.push(diagnostic);
                    }
                } else {
                    if (node.funcfparam && !this.declsTable.ps_match(node)) {
                        const diagnostic = new vscode.Diagnostic(
                            new vscode.Range(node.position, new vscode.Position(node.position.line, node.position.character + node.name.length)),
                            node.name + ' FuncParams do not match',
                            vscode.DiagnosticSeverity.Error
                        );
                        diagnosticsArray.push(diagnostic);
                    }
                }
            }

        });

        this.declsTable.getnode().forEach(node => {
            let shadow_line = this.declsTable.isshadow(node);
            // console.log("~~~", node.name, node.range, shadow_line);
            if (shadow_line != -1){
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(node.position, new vscode.Position(node.position.line, node.position.character + node.name.length)),
                    node.name + ' shadows ' + node.name + ' in line ' + (shadow_line + 1) + '.',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnosticsArray.push(diagnostic);
            }
        });

        this.diagnostics.set(document.uri, diagnosticsArray);
        // console.log(this.declsTable);
        // console.log(this.varsTable);
        // console.log(diagnosticsArray);
    }

    public clearDiagnostics(
        document: vscode.TextDocument
    ){
        this.diagnostics.delete(document.uri);
    }

    async findAllConstDecls(){ 
        const vardefs = await ast.getAstModel();
        this.declsTable.add_arrs_DI(vardefs);
        console.warn(this.declsTable.nodes)
    }

    async findAllIdents(){ 
        const varidents = await ast.getAstModel_Ident();
        this.varsTable.add_arrs(varidents);
        // console.log(tmp);
    }

}