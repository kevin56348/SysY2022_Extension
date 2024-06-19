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
            markdownString.appendMarkdown(`I am a **WELL-DEFINED** identifier:${hoveredWord} in line ${position.line}\n Def: `);
            markdownString.appendCodeblock(`${document.lineAt(ranges[0].pos.line).text}`, 'sys-y');
            markdownString.appendMarkdown(`At Line: ${ranges[0].pos.line}`);
        } else if (ranges.length == 0) {
            markdownString.appendMarkdown(`I am a **UNDEFINED** identifier:${hoveredWord} in line ${position.line}`);
        } else {
            var closest: ast.DefsInside = ranges[0];
            ranges.forEach(r => {
                if (closest.range.contains(r.range)) {
                    closest = r;
                }
            });
            markdownString.appendMarkdown(`I am a **MULTI-DEFINED** identifier:${hoveredWord} in line ${position.line}\n Def: `);
            markdownString.appendCodeblock(`${document.lineAt(closest.pos.line).text}`, 'sys-y');
            markdownString.appendMarkdown(`At Line: ${closest.pos.line}`);
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

}



