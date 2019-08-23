import * as vscode from 'vscode'
import { buildTeamData, sendData } from './api'
import { Team } from './types/vcslack'

export const activate = async (context: vscode.ExtensionContext) => {
  const config = vscode.workspace.getConfiguration('vcslack')
  const tokens: string[] | undefined = config.get('selfToken')

  if (!tokens) {
    vscode.window.showErrorMessage(
      `VCSlack: You should probably add some Slack tokens!
        1. Go to settings
        2. Search for "vcslack"
        3. Click edit in settings.json
        4. Add VCSlack setting in following format:
          "vcslack.selfToken": [
            "xoxp-358484..."
          ]`
    )
  } else if (Array.isArray(tokens) && tokens.length === 0) {
    vscode.window.showErrorMessage(
      `VCSlack: You should probably add some Slack tokens!
        1. Go to settings
        2. Search for "vcslack"
        3. Click edit in settings.json
        4. Add VCSlack setting in following format:
          "vcslack.selfToken": [
            "xoxp-358484...
          ]`
    )
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

const reloadConfig = async (context: vscode.ExtensionContext) => {
  const NEW_CONFIG: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
    'vcslack'
  )
  const NEW_TOKENS: string[] | undefined = NEW_CONFIG.get('selfToken')

  if (!NEW_TOKENS) {
    vscode.window.showErrorMessage(
      'VCSlack: Please add a Slack legacy token before proceeding'
    )
  } else {
    context.globalState.update('tokens', NEW_TOKENS)
    context.globalState.update('teams', await buildTeamData([...NEW_TOKENS]))
  }
}

const selectTeam = async (context: vscode.ExtensionContext) => {
  if (typeof vscode.window.activeTextEditor === 'undefined') {
    return vscode.window.showErrorMessage(
      "Can't send snippet with no open code document!"
    )
  }

  const tokens = context.globalState.get('tokens') as string[]
  const teams = context.globalState.get('teams') as Team[]
  const options = {
    placeHolder: 'Which team/user would you like to send a snippet to?',
    ignoreFocusOut: false
  }

  if (!tokens) {
    return vscode.window.showErrorMessage(
      'VCSlack: Please add a Slack legacy token before proceeding'
    )
  }

  if (teams && teams.length > 0) {
    const names = teams
      .filter(x => x && x.name)
      .map(x => x.name)
      .concat(['Missing Team? Reload VCSlack Teams'])

    return vscode.window
      .showQuickPick(names, options)
      .then(selectedChannel => selectChannel(selectedChannel, context))
  }

  if (tokens && teams.length === 0) {
    context.globalState.update('teams', await buildTeamData([...tokens]))

    const newTeams = context.globalState.get('teams') as Team[]
    const names = newTeams
      .filter(x => x && x.name)
      .map(x => x.name)
      .concat(['Missing Team? Reload VCSlack Teams'])

    return vscode.window
      .showQuickPick(names, options)
      .then(selectedChannel => selectChannel(selectedChannel, context))
  }

  return
}

const selectChannel = async (
  selectedChannel: string | undefined,
  context: vscode.ExtensionContext
): Promise<any> => {
  const tokens = context.globalState.get('tokens') as string[]
  const teams = context.globalState.get('teams') as Team[]

  if (selectedChannel === 'Missing Team? Reload VCSlack Teams') {
    vscode.window.showInformationMessage('VCSlack: Fetching team data')
    context.globalState.update('teams', await buildTeamData([...tokens]))

    return selectTeam(context)
  }

  if (teams.length > 0) {
    const [matchingTeam] = teams.filter(x => x.name === selectedChannel)

    if (matchingTeam && matchingTeam.channelList) {
      const channelList = matchingTeam.channelList.map(
        ({ label, description, id }) => ({
          label: label ? label : 'Unknown',
          description,
          id
        })
      )

      return vscode.window
        .showQuickPick(channelList, {
          matchOnDescription: true,
          placeHolder: 'Please select a Slack channel'
        })
        .then(
          matchingChannel =>
            matchingChannel && sendData(matchingChannel, matchingTeam)
        )
    }

    return
  }

  return
}
