import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { SysYNumberHover, SysYIdentHover } from "./hover.js"
import { FunctionExtractionProvider, extractFunctionCommand, reverseBooleanCommand, BooleanReverseProvider, renameIdentCommand, IdentRenameProvider} from "./refactor.js"
import { IdentDiagnostic } from "./diagnostic.js"
import { QuickFix } from './quickfix.js';

let client: LanguageClient;
let identdiagnostic: IdentDiagnostic;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {

    identdiagnostic = new IdentDiagnostic();

    if (vscode.window.activeTextEditor) {
        // console.log("~~~activeTextEditor");
        identdiagnostic.updateDiagnostics(vscode.window.activeTextEditor.document);
	
    }

    context.subscriptions.push(
		vscode.languages.registerHoverProvider(
            'sys-y',
            new SysYNumberHover()
        ),
        vscode.languages.registerHoverProvider(
            'sys-y',
            new SysYIdentHover()
        ),
        vscode.commands.registerTextEditorCommand(
            'refactor.extract.function',
            extractFunctionCommand,
        ),
        vscode.commands.registerTextEditorCommand(
            'refactor.reverse.boolean',
            reverseBooleanCommand,
        ),
        vscode.commands.registerTextEditorCommand(
            'refactor.rename.ident',
            renameIdentCommand,
        ),
        vscode.languages.registerCodeActionsProvider(
            "sys-y",
            new FunctionExtractionProvider(), 
            {
                providedCodeActionKinds: FunctionExtractionProvider.ACTION_KINDS,
            }
        ),
        vscode.languages.registerCodeActionsProvider(
            "sys-y",
            new BooleanReverseProvider(),
            {
                providedCodeActionKinds: BooleanReverseProvider.ACTION_KINDS,
            }
        ),
        vscode.languages.registerCodeActionsProvider(
            "sys-y",
            new IdentRenameProvider(),
            {
                providedCodeActionKinds: IdentRenameProvider.ACTION_KINDS,
            }
        ),
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                // console.log("~~~onDidChangeTextDocument");
                identdiagnostic.updateDiagnostics(event.document);
            }
        }),
        vscode.workspace.onDidCloseTextDocument(doc => {
            // console.log("~~~onDidCloseTextDocument");
            identdiagnostic.clearDiagnostics(doc);
        }),
        vscode.window.onDidChangeActiveTextEditor(editor =>{
            if (editor){
            // console.log("~~~onDidChangeActiveTextEditor");
            identdiagnostic.updateDiagnostics(editor.document);
            }
        }),
        

      );

      context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            [{ language: 'sys-y', scheme: '*' }],
            new QuickFix(),
            {
                providedCodeActionKinds: QuickFix.providedCodeActionKinds
            }
        )
    );


    client = startLanguageClient(context);
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
