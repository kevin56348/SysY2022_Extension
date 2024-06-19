import { CodeActionProvider, CodeAction, CancellationToken, CodeActionContext, Command, ProviderResult, Range, TextDocument, Diagnostic, CodeActionKind, WorkspaceEdit, Position } from "vscode";

export class QuickFix implements CodeActionProvider {

    static readonly providedCodeActionKinds = [CodeActionKind.QuickFix];

    public provideCodeActions(document: TextDocument, 
        range: Range,
        context: CodeActionContext, 
        token: CancellationToken)
        : ProviderResult<(Command | CodeAction)[]> {

        const actions: CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic.message.includes('shadows')) {
                const fix = this.shadowrename(document, diagnostic);
                actions.push(fix);
            }
            if (diagnostic.message.includes('was not declared in this scope.')) {
                const fix = this.newdeclare(document, diagnostic);
                actions.push(fix);
            }
            if (diagnostic.message.includes('Unused var')) {
                const fix = this.deleteident(document, diagnostic);
                actions.push(fix);
            }
        }

        return actions;
    }

    shadowrename(document: TextDocument, diagnostic: Diagnostic): CodeAction {
        const fix = new CodeAction(`Rename variable`, CodeActionKind.QuickFix);
        fix.edit = new WorkspaceEdit();
        let match = diagnostic.message.match(/(.+) shadows/);
        let ident_name = 'ident';
        if (match){
            ident_name = match[0];
            ident_name = ident_name.replace(/ shadows/, "");
            // console.warn(ident_name);
        }
        const range = diagnostic.range;
        fix.edit.replace(document.uri, range, 'new_'+ ident_name);
        fix.diagnostics = [diagnostic];
        fix.isPreferred = true;
        return fix;
    }

    newdeclare(document: TextDocument, diagnostic: Diagnostic): CodeAction {
        const fix = new CodeAction(`declare ident`, CodeActionKind.QuickFix);
        fix.edit = new WorkspaceEdit();
        let match = diagnostic.message.match(/(.+) was not declared in this scope/);
        let ident_name = 'ident';
        if (match){
            ident_name = match[0];
            ident_name = ident_name.replace(/ was not declared in this scope/, "");
            // console.warn(ident_name);
        }
        const range = diagnostic.range;
        const aim_line = document.lineAt(range.start.line);
        let blanks = '\t';
        const blanks_match = aim_line.text.match(/\s*/);
        if (blanks_match){
            blanks = blanks_match[0];
        }

        fix.edit.replace(document.uri, new Range(new Position(range.start.line, 0), new Position(range.start.line, 0)), blanks + 'int | float '+ ident_name + ' = default;\n');
        fix.diagnostics = [diagnostic];
        fix.isPreferred = true;
        return fix;
    }

    deleteident(document: TextDocument, diagnostic: Diagnostic): CodeAction {
        const fix = new CodeAction(`delete this line`, CodeActionKind.QuickFix);
        fix.edit = new WorkspaceEdit();
        const range = diagnostic.range;
        const aim_line = document.lineAt(range.start.line);
        fix.edit.delete(document.uri, new Range(new Position(range.start.line, 0), new Position(range.start.line, aim_line.range.end.character)));
        fix.diagnostics = [diagnostic];
        fix.isPreferred = true;
        return fix;
    }

}