import * as vscode from "vscode"
import * as request from "request-promise-native"
import { pipe, resolve, mapAsync } from "rambdax"

const SLACK_API = {
  post: "https://slack.com/api/",
  file_upload: "files.upload",
  api_chat_post: "chat.postMessage",
  team_info: "team.info",
  groups_list: "groups.list",
  channels_list: "channels.list",
  user_list: "users.list"
}

type DataT = {
  token?: string,
  channels?: string,
  content?: string | boolean,
  filename?: string,
  filetype: string,
  title: string
}

type Channel = {
  id: string,
  name: string
}

type Member = {
  id: string,
  name: string,
  profile: {
    real_name: string
  }
}

type Group = {
  id: string,
  name: string,
  topic: {
    value: string
  }
}

interface ChannelList {
  id?: string
  label?: string
  description?: string
}

interface Team {
  token: string
  name: string
  channelList: ChannelList[]
}

interface State {
  tokens?: string | string[]
  teams: Team[]
}

let State: State = {
  teams: []
}

const fetchTeams = async (token: string) => {
  const form = { form: { "token": token } }

  const data = JSON.parse(await request.post(
    `${ SLACK_API.post + SLACK_API.team_info}`,
    form
  ))

  if (data && data.team && data.team.name) {
    return {
      name: data.team.name,
      token: token
    }
  }

  return
}

const buildTeamData = pipe(
  mapAsync(fetchTeams),
  resolve(
    mapAsync(getPostList)
  )
) as (x: any[]) => Promise<Team[]>

async function reloadConfig() {
  const NEW_CONFIG: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('vcslack')
  const NEW_TOKENS: string[] | undefined = NEW_CONFIG.get('selfToken')

  if (!NEW_TOKENS) {
    vscode.window.showErrorMessage('VCSlack: Please add a Slack legacy token before proceeding')
  } else {
    State = {
      ...State,
      teams: await buildTeamData([...NEW_TOKENS])
    }
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('vcslack')
  const tokens: string[] | undefined = config.get('selfToken')

  if (!tokens) {
    vscode.window.showErrorMessage('VCSlack: You should probably add some Slack tokens!')
  } else {
    State = {
      ...State,
      tokens,
      teams: await buildTeamData([...tokens])
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('vcslack.sendSnippet', selectTeam),
    vscode.workspace.onDidChangeConfiguration(reloadConfig),
  )
}

async function selectTeam() {
  if (typeof vscode.window.activeTextEditor === 'undefined') {
    return vscode.window.showErrorMessage("Can't send snippet with no open code document!")
  }

  const options = {
    placeHolder: "Which team/user would you like to send a snippet to?",
    ignoreFocusOut: false
  }

  if (State && !State.tokens) {
    return vscode.window.showErrorMessage('VCSlack: Please add a Slack legacy token before proceeding')
  }

  if (State && State.teams.length > 0) {
    const names = State.teams.filter(x => x && x.name).map(x => x.name).concat(['Missing Team? Reload VCSlack Teams'])

    return vscode.window.showQuickPick(names, options).then(selectChannel)
  }

  if (State && State.tokens && State.teams.length === 0) {
    State = {
      ...State,
      teams: await buildTeamData([...State.tokens])
    }

    const names = State.teams.filter(x => x && x.name).map(x => x.name).concat(['Missing Team? Reload VCSlack Teams'])

    return vscode.window.showQuickPick(names, options).then(selectChannel)
  }

  return
}

const organizeUserInfo = (body: string) => {
  if (body) {
    const data = JSON.parse(body)

    if (data && data.channels) {
      return data.channels.map(( channel: Channel ) => ({
        id: channel.id,
        label: `#${channel.name}`
      }))
    }

    if (data.members) {
      return data.members.map(( member: Member ) => ({
        id: member.id,
        label: `@${ member.name }`, description: member.profile.real_name
      }))
    }

    if (data.groups) {
      return data.groups.map(( group: Group ) => ({
        id: group.id,
        label: `#${group.name}`,
        description: group.topic.value
      }))
    }
  }
}

async function getPostList({ name, token }: { name: string, token: string }) {
  const channels = SLACK_API.post + SLACK_API.channels_list
  const groups = SLACK_API.post + SLACK_API.groups_list
  const users = SLACK_API.post + SLACK_API.user_list
  const form = {
    form: {
      "token": token
    }
  }

  return {
    name,
    token,
    channelList: (await Promise.all(
      [ channels, groups, users ].map(async url => await request.post(url, form)
        .then(organizeUserInfo)
        .catch(e => vscode.window.showErrorMessage(e))
      )
    )).flat()
  }
}

async function selectChannel(selectedChannel: string): Promise<any> {
  if (selectedChannel === 'Missing Team? Reload VCSlack Teams' && State.tokens) {
    State = {
      ...State,
      teams: await buildTeamData([...State.tokens])
    }

    return selectTeam()
  }

  if (State && State.teams.length > 0) {
    const [ matchingTeam ] = State.teams.filter(x => x.name === selectedChannel)

    if (matchingTeam && matchingTeam.channelList) {
      const channelList = matchingTeam.channelList.map(({ label, description, id }) => ({
        label: label ? label : 'Unknown',
        description,
        id
      }))

      return vscode.window.showQuickPick(channelList, {
        matchOnDescription: true,
        placeHolder: "Please select a Slack channel"
      }).then((matchingChannel) => matchingChannel && sendData(matchingChannel, matchingTeam))
    }

    return
  }

  return
}

async function sendData(matchingChannel: ChannelList, matchingTeam: Team) {
  if (!vscode.window.activeTextEditor) {
    return
  }

  const editor = vscode.window.activeTextEditor
  const document = editor.document
  const selection = editor.selection
  const filenameWithPath = document.fileName
  const filetype = document.languageId
  const text = document.getText(selection) !== '' ? document.getText(selection) :
    document.getText() !== '' ? document.getText() : false
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri)
  const relativePath = vscode.workspace.asRelativePath(editor.document.uri)

  // Adjust vscode filetypes to slack API
  let { adjustedFiletype, actualFilename, filename, relativePathFull }: { adjustedFiletype?: string, actualFilename?: string, filename?: string, relativePathFull?: string } = {
    adjustedFiletype: undefined,
    actualFilename: undefined,
    filename: undefined,
    relativePathFull: undefined
  }

  switch (filetype) {
    case 'plaintext':
      adjustedFiletype = 'text'
      break
    case 'scss':
      adjustedFiletype = 'sass'
      break
    case 'javascriptreact':
      adjustedFiletype = 'jsx'
      break
    case 'typescriptreact':
      adjustedFiletype = 'jsx'
      actualFilename = 'tsx'
      break
    default:
      adjustedFiletype = filetype
  }

  if(filenameWithPath.indexOf('\\') !== -1) {
    filename = filenameWithPath.substring(filenameWithPath.lastIndexOf('\\') + 1)
  } else {
    filename = filenameWithPath.substring(filenameWithPath.lastIndexOf('/') + 1)
  }

  if (filenameWithPath === 'Untitled-1') {
    filename = `${filenameWithPath}.${actualFilename ? actualFilename : adjustedFiletype}`
  }

  if (workspaceFolder && workspaceFolder.name) {
    relativePathFull = `Workspace: ${workspaceFolder.name} Path: ${relativePath}`
  } else {
    relativePathFull = `Path: ${relativePath}`
  }

  let data: DataT = {
    "token": matchingTeam.token,
    "channels": matchingChannel && matchingChannel.id,
    "content": text,
    "filename": filename,
    "filetype": adjustedFiletype,
    "title": relativePath === 'Untitled-1' ? `${filename} sent from VCSlack` : `${relativePathFull} sent from VCSlack`
  }

  return text ?
    await request.post(
      SLACK_API.post + SLACK_API.file_upload,
      { formData: data },
      (err, res, body) => {
        if (!err && res.statusCode == 200) {
          vscode.window.showInformationMessage("Snippet sent!")
        } else {
          vscode.window.showErrorMessage("Error, couldn't send snippet")
        }
      }
    )
    :
    vscode.window.showWarningMessage("Warning: Your selection/document appears to be empty")
}
