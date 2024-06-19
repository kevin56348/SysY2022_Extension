import { CodeActionProvider, CodeAction, CancellationToken, CodeActionContext, Command, ProviderResult, Range, TextDocument, Diagnostic, CodeActionKind, WorkspaceEdit } from "vscode";

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
}