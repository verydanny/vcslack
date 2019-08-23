import * as vscode from 'vscode'
import { legacyTokenError, noOpenDocumentError } from './const'
import { buildTeamData, sendData } from './api'
import { Team } from './types/vcslack'

export const reloadConfig = async (context: vscode.ExtensionContext) => {
  const newConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
    'vcslack'
  )
  const newTokens: string[] | undefined = newConfig.get('selfToken')

  if (!newTokens || (Array.isArray(newTokens) && newTokens.length === 0)) {
    vscode.window.showErrorMessage(legacyTokenError)
  } else {
    context.globalState.update('tokens', newTokens)
    context.globalState.update('teams', await buildTeamData([...newTokens]))
  }
}

export const selectTeam = async (context: vscode.ExtensionContext) => {
  if (typeof vscode.window.activeTextEditor === 'undefined') {
    return vscode.window.showErrorMessage(noOpenDocumentError)
  }

  const tokens = context.globalState.get('tokens') as string[]
  const teams = context.globalState.get('teams') as Team[]
  const options = {
    placeHolder: 'Which team/user would you like to send a snippet to?',
    ignoreFocusOut: true
  }

  if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
    return vscode.window.showErrorMessage(legacyTokenError)
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
        ({ label, description, id, detail }) => ({
          label: label ? label : 'Unknown',
          description,
          detail,
          id
        })
      )

      return vscode.window
        .showQuickPick(channelList, {
          matchOnDescription: true,
          matchOnDetail: true,
          ignoreFocusOut: true,
          placeHolder: 'Please select a Slack channel, group, or user'
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
