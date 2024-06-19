import {
    CodeAction,
    CodeActionKind,
    CodeActionProvider,
    Command,
    ProviderResult,
    TextEditor,
    TextEditorEdit,
    Position,
    TextDocument,
    Range,
    window
} from 'vscode';
import * as ast from "../language/ASTTest.js"
import { Node, IdentTable } from '../utils/IdentTable.js';
// import { IdentRename } from './rename.js';

export type TriggeredFrom = 'onSave' | 'onCommand' | 'codeAction';

const CODE_ACTIONS1 = [
    {
        title: 'Extract Function',
        kind: CodeActionKind.RefactorExtract.append('refactor_function'),
        command: 'refactor.extract.function',
    },
    
];

const CODE_ACTIOINS2 = [
    {
        title: 'Reverse Boolean',
        kind: CodeActionKind.RefactorRewrite.append('refactor_reverse_boolean'),
        command: 'refactor.reverse.boolean',
    },
];

const CODE_ACTIOINS3 = [
    {
        title: 'Rename Ident',
        kind: CodeActionKind.RefactorRewrite.append('refactor_rename_ident'),
        command: 'refactor.rename.ident',
    },
];

export class FunctionExtractionProvider implements CodeActionProvider {
    static readonly ACTION_ID = 'refactor.extract.function';
    static readonly ACTION_KINDS = CODE_ACTIONS1.map(action => action.kind);
    static readonly ACTION_COMMANDS = CODE_ACTIONS1.map(({ title, kind, command }) => {
        const action = new CodeAction(title, kind);
        action.command = { command, title};
        return action;
    });

    provideCodeActions(): ProviderResult<(CodeAction | Command)[]> {
        return FunctionExtractionProvider.ACTION_COMMANDS;
    }
}

export class BooleanReverseProvider implements CodeActionProvider{
    static readonly ACTION_ID = 'refactor.reverse.boolean';
    static readonly ACTION_KINDS = CODE_ACTIOINS2.map(action => action.kind);
    static readonly ACTION_COMMANDS = CODE_ACTIOINS2.map(({ title, kind, command }) => {
        const action = new CodeAction(title, kind);
        action.command = { command, title};
        return action;
    });

    provideCodeActions(): ProviderResult<(CodeAction | Command)[]> {
        return BooleanReverseProvider.ACTION_COMMANDS;
    }
}

function findExpLine(text: string, a: RegExp): number {
    const textlines = text.split('\n');
    var main_position: number = -1;
    var line_count = 0;
    textlines.forEach(l => {
        if (l.search(a) != -1 && (main_position == -1)) {
            main_position = line_count;
        }
        line_count++;
    });
    return main_position;
}

export function fullRange(document: TextDocument) {
    const lastLine = document.lineCount - 1;
    const lastCharacter = document.lineAt(lastLine).text.length;
    return new Range(0, 0, lastLine, lastCharacter);
}

export async function extractFunctionCommand(editor: TextEditor, _: TextEditorEdit, from?: TriggeredFrom) {
    if (!editor) {
        return;
    }
    const { document } = editor;
    if (!document) {
        return;
    }
    let refactored: string;

    const text = document.getText();
    const regMainFunc = /\s*main\s*/g;
    const main_position = findExpLine(text, regMainFunc);
    const text_sel = document.getText(editor.selection);
    
    refactored = "int newFunction(params){\n"
        + text_sel
        + "\nreturn 0;\n"
        + "\n}\n\n";
    if (main_position == -1) {
        return;
    } else {
        void editor.edit(edit => {
            edit.replace(editor.selection, "newFunction(params);\n");
            
            edit.insert(new Position(main_position, 0), refactored);
        });
    }
}

export async function reverseBooleanCommand(editor: TextEditor, _: TextEditorEdit, from?: TriggeredFrom) {
    if (!editor) {
        return;
    }
    const { document } = editor;
    if (!document) {
        return;
    }
    var text = document.getText(editor.selection);
    const leftRegIf = /^\s*if\s*\(/g;
    const leftRegElseIf = /^\s*else\s+if\s*\(/g;
    const rightRegIf = /\)(\s|\d|.*)*/g;

    const position = findExpLine(text, leftRegIf);
    if (position == -1) {
        const position2 = findExpLine(text, leftRegElseIf);
        if (position2 == -1) {
            return;
        }
        // else if
        const [cond, ll, lr] = replaceReg(text, leftRegElseIf, rightRegIf);
        if (ll && lr) {
            const refactored = ll[0] + "!(" + cond + ")" + lr[0];
            void editor.edit(edit => {
                edit.replace(editor.selection, refactored);
            });
        }
        return;
    } 

    const [cond, ll, lr] = replaceReg(text, leftRegIf, rightRegIf);
    if (ll && lr) {
        const refactored = ll[0] + "!(" + cond + ")" + lr[0];
        void editor.edit(edit => {
            edit.replace(editor.selection, refactored);
        });
    }
    
}

function replaceReg(text: string, l: RegExp, r:RegExp): [string, RegExpExecArray | null, RegExpExecArray | null] {
    const ll = l.exec(text);
    text = text.replace(l, "");
    const lr = r.exec(text);
    text = text.replace(r, "");
    return [text, ll, lr];
}

export class IdentRenameProvider implements CodeActionProvider {
    static readonly ACTION_ID = 'refactor.rename.ident';
    static readonly ACTION_KINDS = CODE_ACTIOINS3.map(action => action.kind);
    static readonly ACTION_COMMANDS = CODE_ACTIOINS3.map(({ title, kind, command }) => {
        const action = new CodeAction(title, kind);
        action.command = { command, title};
        return action;
    });

    provideCodeActions(): ProviderResult<(CodeAction | Command)[]> {
        return IdentRenameProvider.ACTION_COMMANDS;
    }
}

export async function renameIdentCommand(editor: TextEditor, _: TextEditorEdit, from?: TriggeredFrom) {
    if (!editor) {
        return;
    }
    const { document } = editor;
    if (!document) {
        return;
    }
    var text = document.getText(editor.selection);

    const newVariableName = await window.showInputBox({
        prompt: 'Enter the new variable name',
        value: 'new_ident'
    });

    if (!newVariableName) {
        return; 
    }

    let declsTable = new IdentTable;
    let varsTable = new IdentTable;
    let targetTable = new IdentTable;
    const vardefs = await ast.getAstModel();
    const varidents = await ast.getAstModel_Ident();
    declsTable.add_arrs_DI(vardefs);
    varsTable.add_arrs(varidents);

    let closest_node: Node;

    declsTable.getnode().forEach(node => {
        if (node.name === text && node.position.isBeforeOrEqual(editor.selection.start)){
            targetTable.add_node(node);
        }
    });

    console.log(targetTable);

    if(!targetTable.isempty()){
        console.log("return");
        return;
    }
    else{
        closest_node = targetTable.getnode()[0];
    }

    targetTable.getnode().forEach(node => {
        if (node.position.isAfter(closest_node.position)){
            closest_node = node;
        }
    });
    targetTable.clear();
    targetTable.add_node(closest_node);

    varsTable.getnode().forEach(node => {
        if (node.name === text && closest_node.range.contains(node.position)){
            targetTable.add_node(node);
        }
    });

    console.log(targetTable);
    editor.edit(edit => {
        targetTable.getnode().forEach(node => {
            console.log(new Range(node.position, new Position(node.position.line, node.position.character + text.length)));
            edit.replace(new Range(node.position, new Position(node.position.line, node.position.character + text.length)), newVariableName);
        });
    });
    
}