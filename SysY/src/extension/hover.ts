import * as vscode from 'vscode';
import * as ast from "../language/ASTTest.js"
// import { Ident } from '../language/generated/ast.js';

let regexDec = /^-?[0-9]+$/g;
// let regexConstDecl = /^\s*const\s+int\s*/g;

export class SysYNumberHover implements vscode.HoverProvider {
    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let markdownString = new vscode.MarkdownString();
        if (regexDec.test(hoveredWord.toString())) {
            let input: Number = Number(hoveredWord.toString());
            markdownString.appendCodeblock(`Hex:\n0x${input.toString(16).toUpperCase()}\n\Binary:\n0b${input.toString(2).replace(/(^\s+|\s+$)/, '')}\nOctal:\n0${input.toString(8)} `, 'sys-y');
            return {
                contents: [markdownString]
            };
        }
        return {
            contents: [markdownString]
        };
    }
}

export class SysYIdentHover implements vscode.HoverProvider {

    decls: Array<ast.DefsInside> = [];

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let markdownString = new vscode.MarkdownString();
        this.decls = [];
        // console.log(wholeLine);
        this.findAllConstDecls();

        this.decls.forEach(decl => {
            if (decl.ident == hoveredWord) {
                console.log("Found at: " + decl.pos);
            }
            markdownString.appendCodeblock(`I am a happy identifier:${hoveredWord} in line ${position.line}\n Def: ${document.lineAt(decl.pos.line).text}\n At Line: ${decl.pos.line}`, 'sys-y');
        
        });
        markdownString.appendCodeblock(`I amSSS a happy identifier:${hoveredWord} in line ${position.line}\n Def: `, 'sys-y');

        // not found
        // markdownString.appendCodeblock(`I am a longly identifier:${hoveredWord} in line ${position.line}\n ${wholeLine}`, 'sys-y');

        return {
            contents: [markdownString]
        };
    };

    findAllConstDecls(){ 
        const vardefs = ast.getAstModel();

        vardefs.then(
            res => {
                // console.log(res);
                res.forEach(r => {
                    console.log(r);
                    this.decls = res;
                });
                
            }
        ).catch(
            err => {
                console.error(err);
            }
        );
    };

}



