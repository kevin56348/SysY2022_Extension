import {
    CodeAction,
    CodeActionKind,
    CodeActionProvider,
    Command,
    ProviderResult,
} from 'vscode';

const CODE_ACTIONS = [
    {
        title: 'Sort Imports/Exports',
        // Correspond to `SortActionProvider.ACTION_ID`
        kind: CodeActionKind.RefactorExtract.append('refactor_function'),
        command: 'refactor.extract.function',
    },
];

export class mymyProvider implements CodeActionProvider {
    static readonly ACTION_ID = 'refactor.extract.function';
    static readonly ACTION_KINDS = CODE_ACTIONS.map(action => action.kind);
    static readonly ACTION_COMMANDS = CODE_ACTIONS.map(({ title, kind, command }) => {
        const action = new CodeAction(title, kind);
    //   const from: TriggeredFrom = 'codeAction';
        action.command = { command, title};
        return action;
    });

    provideCodeActions(): ProviderResult<(CodeAction | Command)[]> {
        return mymyProvider.ACTION_COMMANDS;
    }
}
