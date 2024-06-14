import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { SysYNumberHover, SysYIdentHover } from "./hover.js"
import { mymyProvider } from "./refactor.js"

export type TriggeredFrom = 'onSave' | 'onCommand' | 'codeAction';

let client: LanguageClient;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
		vscode.languages.registerHoverProvider(
		  [
			{ language: 'sys-y', scheme: '*' }
		  ],
		  new SysYNumberHover()
		)
    );

    context.subscriptions.push(
		vscode.languages.registerHoverProvider(
		  [
			{ language: 'sys-y', scheme: '*' }
		  ],
		  new SysYIdentHover()
		)
    );

    const sortCommand = vscode.commands.registerTextEditorCommand(
        'refactor.extract.function',
        sortImportsByCommand,
      );
    const beforeSave = vscode.workspace.onWillSaveTextDocument(sortImportsBeforeSavingDocument);
    
    context.subscriptions.push(
        sortCommand,
        beforeSave,
        vscode.languages.registerCodeActionsProvider("sys-y", new mymyProvider(), {
          providedCodeActionKinds: mymyProvider.ACTION_KINDS,
        }),
      );

    client = startLanguageClient(context);
    
}
function sortImportsBeforeSavingDocument(event: vscode.TextDocumentWillSaveEvent) {
    const { document } = event;
    const format = async () => {
    //   const newSourceText = await formatDocument(document, 'onSave');
    //   if (newSourceText === undefined) return [];
      return [vscode.TextEdit.replace(fullRange(document), document.getText())];
    };
    event.waitUntil(format());
}
  
async function sortImportsByCommand(editor: vscode.TextEditor, _: vscode.TextEditorEdit, from?: TriggeredFrom) {
    if (!editor) {
        return;
    }
    const { document } = editor;
    if (!document) {
        return;
    }
    void editor.edit(edit => edit.replace(fullRange(document), "Hello"));
  }

function fullRange(document: vscode.TextDocument) {
    const lastLine = document.lineCount - 1;
    const lastCharacter = document.lineAt(lastLine).text.length;
    return new vscode.Range(0, 0, lastLine, lastCharacter);
}
  
// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'sys-y' }]
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'sys-y',
        'SysY',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
    return client;
}
