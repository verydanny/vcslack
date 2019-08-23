import * as vscode from 'vscode'
import { legacyTokenHelpfulError } from './const'
import { buildTeamData } from './api'
import { reloadConfig, selectTeam } from './commands'

export const activate = async (context: vscode.ExtensionContext) => {
  const config = vscode.workspace.getConfiguration('vcslack')
  const tokens: string[] | undefined = config.get('selfToken')

  if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
    vscode.window.showErrorMessage(legacyTokenHelpfulError)
  } else {
    context.globalState.update('tokens', tokens)
    context.globalState.update('teams', await buildTeamData([...tokens]))
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('vcslack.sendSnippet', () =>
      selectTeam(context)
    ),
    vscode.workspace.onDidChangeConfiguration(() => reloadConfig(context))
  )
}

export const deactivate = () => {}
