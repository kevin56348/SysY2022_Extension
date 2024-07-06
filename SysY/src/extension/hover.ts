import * as vscode from 'vscode';
import * as ast from "../utils/ASTTest.js"
import { IdentTable } from '../utils/IdentTable.js';
// import { toString } from 'langium/generate';
// import { Ident } from '../language/generated/ast.js';

let regexDec = /^-?[0-9]+$/g;
let regexHex = /[+-]?[0][xX][0-9a-fA-F]+/g;
let regexOct = /[+-]?[0][0-7]+/g;

// let regexConstDecl = /^\s*const\s+int\s*/g;

export class SysYNumberHover implements vscode.HoverProvider {
    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let markdownString = new vscode.MarkdownString();
        if (regexHex.test(hoveredWord.toString())) {
            let input: Number = Number(parseInt(hoveredWord.toString(), 16));
            if (!Number.isNaN(input))
                markdownString.appendCodeblock(`Hex:\n0x${input.toString(16).toUpperCase()}\n\Binary:\n0b${input.toString(2).replace(/(^\s+|\s+$)/, '')}\nOctal:\n0${input.toString(8)}\nDecimal:\n0${input.toString(10)} `, 'sys-y');
            return {
                contents: [markdownString]
            };
        } else if (regexOct.test(hoveredWord.toString()) === true) {
            let input: Number = Number(parseInt(hoveredWord.toString(), 8));
            if (!Number.isNaN(input))
                markdownString.appendCodeblock(`Hex:\n0x${input.toString(16).toUpperCase()}\n\Binary:\n0b${input.toString(2).replace(/(^\s+|\s+$)/, '')}\nOctal:\n0${input.toString(8)}\nDecimal:\n0${input.toString(10)} `, 'sys-y');
            return {
                contents: [markdownString]
            };
        } else if (regexDec.test(hoveredWord.toString()) === true) {
            let input: Number = Number(parseInt(hoveredWord.toString(), 10));
            if (!Number.isNaN(input))
                markdownString.appendCodeblock(`Hex:\n0x${input.toString(16).toUpperCase()}\n\Binary:\n0b${input.toString(2).replace(/(^\s+|\s+$)/, '')}\nOctal:\n0${input.toString(8)}\nDecimal:\n0${input.toString(10)} `, 'sys-y');
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
    idents: IdentTable = new IdentTable();

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ) {
        let hoveredWord = document.getText(document.getWordRangeAtPosition(position));
        let markdownString = new vscode.MarkdownString();
        // console.log(wholeLine);
        await this.findAllConstDecls();
        var ranges: ast.DefsInside[] = [];

        // console.log(this.decls);
        this.decls.forEach(decl => {
            if (decl.ident == hoveredWord && position.isAfterOrEqual(decl.range.start) && position.isBefore(decl.range.end)) {
                // console.log("Found at: " + decl.pos.line);
                ranges.push(decl);
            }
        });
        if (ranges.length == 1) {
            markdownString.appendMarkdown(`I am a **WELL-DEFINED** identifier:${hoveredWord} in line ${position.line + 1}\n Def: `);
            markdownString.appendCodeblock(`${document.lineAt(ranges[0].pos.line).text}`, 'sys-y');
            markdownString.appendMarkdown(`At Line: ${ranges[0].pos.line + 1}`);
        } else if (ranges.length == 0 && this.idents.inTable(hoveredWord)) {
            if(hoveredWord.charAt(0) >= 'a' && hoveredWord.charAt(0) <= 'z' || hoveredWord.charAt(0) >= 'A' && hoveredWord.charAt(0) <= 'Z' || hoveredWord.charAt(0) == '_')
            markdownString.appendMarkdown(`I am a **UNDEFINED** identifier:${hoveredWord} in line ${position.line + 1}`);
        } else {
            var closest: ast.DefsInside = ranges[0];
            ranges.forEach(r => {
                if (closest.range.contains(r.range)) {
                    closest = r;
                }
            });
            markdownString.appendMarkdown(`I am a **MULTI-DEFINED** identifier:${hoveredWord} in line ${position.line + 1}\n Def: `);
            markdownString.appendCodeblock(`${document.lineAt(closest.pos.line).text}`, 'sys-y');
            markdownString.appendMarkdown(`At Line: ${closest.pos.line + 1}`);
        }

        return {
            contents: [markdownString]
        };
    };

    async findAllConstDecls(){ 
        const vardefs = await ast.getAstModel();

        // console.warn(res);
        vardefs.forEach(r => {
            // console.log(r);
        });
        this.decls = vardefs;
    };


    async findAllIdents(){ 
        const vardefs = await ast.getAstModel_Ident();

        // console.warn(res);
        vardefs.forEach(r => {
            // console.log(r);
        });
        this.idents.add_arrs(vardefs);
    };
}



