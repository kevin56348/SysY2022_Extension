import * as vscode from 'vscode';
import * as ast from "../language/ASTTest.js"


let regexDec = /^-?[0-9]+$/g;
let regexConstDecl = /^\s*const\s*int\s*/g;

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
    identsArrayLv: Array<number> = [];

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let wholeLine = document.lineAt(position.line).text;
        let markdownString = new vscode.MarkdownString();
        this.identsArray = [];
        this.identsArrayCorLineNum = [];
        this.identsArrayLv = [];
        // console.log(wholeLine);
        this.findAllConstDecls();
        this.findAllIdents();
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

    findAllConstDecls(){ 
        var vardefs = ast.getAstModel();

        vardefs.then(
            res => {
                // console.log(res);
                res.forEach(r => {
                    console.log(r);
                    this.identsArray.push(r[0]);
                    this.identsArrayCorLineNum.push(r[1].line);
                    this.identsArrayLv.push(r[2]);
                });
                
            }
        )
    };

    findAllIdents(){ 
        var varidents = ast.getAstModel_Ident();

        varidents.then(
            res => {
                // console.log(res);
                res.forEach(r => {
                    console.log("~~~~idents: ");
                    console.log(r);
                    // this.identsArray.push(r[0]);
                    // this.identsArrayCorLineNum.push(r[1].line);
                    // this.identsArrayLv.push(r[2]);
                });
                
            }
        )
    };
}



