import * as vscode from 'vscode';
import * as ast from "../language/ASTTest.js"
// import { ConstDef } from '../language/generated/ast.js';
// import type { AstNode, ValidationAcceptor } from 'langium';


let regexDec = /^-?[0-9]+$/g;
// let regexDeclRest = /(\[\d*\]){0,2}(\s*=.*)?\s*;/g;
let regexConstDecl = /^\s*const\s*int\s*/g;
// let regexVarDecl = /^\s*int\s*/g;
// let regexFuncDecl = /^\s*(int|void)\s*[a-zA-Z_][a-zA-Z_0-9]*\s*\(.*/g;
// let regexFuncDeclFirst = /^\s*(int|void)\s*/g;
// let regexFuncDeclLast = /\s*\(.*/g;
// let regexIdents = /^[a-zA-Z_][a-zA-Z_0-9]*$/g;

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

    identsArray: Array<string> = [];
    identsArrayCorLineNum: Array<number> = [];

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let wholeLine = document.lineAt(position.line).text;
        let markdownString = new vscode.MarkdownString();
        this.identsArray = [];
        this.identsArrayCorLineNum = [];
        // console.log(wholeLine);
        this.findAllConstDecls(document);
        let kk = null;
        let io = this.identsArray.indexOf(hoveredWord);
        if (io != -1) {
            console.log("Found at: " + this.identsArrayCorLineNum[io]);
            kk = this.identsArrayCorLineNum[io];
        }
        if (kk) {
            markdownString.appendCodeblock(`I am a happy identifier:${hoveredWord} in line ${position.line}\n Def: ${document.lineAt(kk as number).text}\n At Line: ${kk}`, 'sys-y');
        } else {
            // not found
            markdownString.appendCodeblock(`I am a longly identifier:${hoveredWord} in line ${position.line}\n ${wholeLine}`, 'sys-y');
        }
        if (regexConstDecl.test(wholeLine)) {

            // let input: Number = Number(hoveredWord.toString());
            console.log(wholeLine);
            return {
                contents: [markdownString]
            };
        } 
        // markdownString.appendCodeblock('', 'sys-y');
        return {
            contents: [markdownString]
        };
    };

    findAllConstDecls(document: vscode.TextDocument): number | null{ 
        var vardefs = ast.getAstModel(document.getText());

        vardefs.then(
            res => {
                // console.log(res);
                res.forEach(r => {
                    console.log(r);
                    this.identsArray.push(r[0]);
                    this.identsArrayCorLineNum.push(r[1].line);
                });
                
            }
        )

        return null;
    };
}



