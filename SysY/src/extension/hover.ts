import * as vscode from 'vscode';
// import { ConstDef } from '../language/generated/ast.js';
// import type { AstNode, ValidationAcceptor } from 'langium';


let regexDec = /^-?[0-9]+$/g;
let regexDeclRest = /(\[\d*\]){0,2}\s*=.*;/g;
let regexConstDecl = /^\s*const\s*int\s*/g;
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
        

        // markdownString.appendCodeblock('', 'sys-y');
        return {
            contents: [markdownString]
        };
    }

    
}

export class SysYIdentHover implements vscode.HoverProvider {

    static identsArray: Array<string> = [];
    static identsArrayCorLineNum: Array<number> = [];

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let wholeLine = document.lineAt(position.line).text;


        let markdownString = new vscode.MarkdownString();

        // console.log(wholeLine);

        this.findAllConstDecls(document,position);

        let kk = null;
        let io = SysYIdentHover.identsArray.indexOf(hoveredWord);
        
        if (io != -1) {
            console.log("Found at: " + SysYIdentHover.identsArrayCorLineNum[io]);
            kk = SysYIdentHover.identsArrayCorLineNum[io];
        }

        if (kk) {
            markdownString.appendCodeblock(`I am a const identifier:${hoveredWord} in line ${position.line}\n Def: ${document.lineAt(kk as number).text}\n At Line: ${kk}`, 'sys-y');
        } else {
            // not found
            markdownString.appendCodeblock(`I am a const identifier:${hoveredWord} in line ${position.line}\n ${wholeLine}`, 'sys-y');
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

    findAllConstDecls(document: vscode.TextDocument, position: vscode.Position) : number | null{ 

        for (let index = 0; index < document.lineCount; index++) {
            const element = document.lineAt(index).text;
            
            if (regexConstDecl.test(element) && regexDeclRest.test(element)) {
                var t1 = element.replace(regexConstDecl, "");
                t1 = t1.replace(regexDeclRest, "");
                console.warn(t1);
                console.log("Ident: " + t1);
                console.log("At line: " + index);
                console.log("" + SysYIdentHover.identsArray);
                if (SysYIdentHover.identsArray.indexOf(t1) == -1) {
                    console.log("Pushed: " + [t1, index] + "\n index at:" + SysYIdentHover.identsArray.indexOf(t1));
                    SysYIdentHover.identsArray.push(t1);
                    SysYIdentHover.identsArrayCorLineNum.push(index);
                }
            }
            
        }

        
        return null;
    };

}



