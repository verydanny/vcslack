import * as vscode from "vscode"
import * as request from "request-promise"
import { map } from "rambda"

import { statusMaker } from './utils'

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

interface ChannelListT extends vscode.QuickPickItem {
  id: string
}

interface State {
  teamNameObject: {
    [key: string]: string
  },
  selectedTeam?: string,
  channelsList: Array<ChannelListT>,
  selectedChannel?: ChannelListT
}

let state: State = {
  teamNameObject: {

  },
  selectedTeam: undefined,
  channelsList: [],
  selectedChannel: undefined
}

async function reloadConfig() {
  const NEW_CONFIG: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('vcslack')
  const NEW_TOKENS: string[] | undefined = NEW_CONFIG.get('selfToken')

  if (!NEW_TOKENS) {
    return vscode.window.showErrorMessage('Please add a Slack legacy token before proceeding')
  }

  statusMaker("Fetching New Teams", 500)

  delete state.teamNameObject
  async function fetchTeams(token: string) {
    const form = { form: { "token": token } }

    const data = JSON.parse(await request.post(
      `${ SLACK_API.post + SLACK_API.team_info}`,
      form
    ))

    if (data.team && data.team.name) {
      state.teamNameObject = {
        ...state.teamNameObject,
        [data.team.name]: token
      }
    }
  }
  
  return Promise.all(
    map(fetchTeams, NEW_TOKENS)
  ).catch((e: any) => console.log(e))
}

export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('vcslack')
  const tokens: string[] | undefined = config.get('selfToken')

  if (tokens) {
    await Promise.all(
      map(fetchTeams, tokens)
    ).catch((e) => console.log(e))
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('vcslack.sendSnippet', selectTeam),
    vscode.workspace.onDidChangeConfiguration(reloadConfig),
  )
}

async function fetchTeams(token: string) {
  const form = { form: { "token": token } }

  const data = JSON.parse(await request.post(
    `${ SLACK_API.post + SLACK_API.team_info}`,
    form
  ))

  if (data.team && data.team.name) {
    state.teamNameObject = {
      ...state.teamNameObject,
      [data.team.name]: token
    }
  }
}

async function selectTeam() {
  if (typeof vscode.window.activeTextEditor === 'undefined') {
    return vscode.window.showErrorMessage("Can't send snippet with no open code document!")
  }

  const options = {
    placeHolder: "Which team/user would you like to send a snippet to?",
    ignoreFocusOut: false
  }
  const teamNames = Object.keys(state.teamNameObject)

  return vscode.window.showQuickPick(teamNames, options)
    .then((selectedTeam) => {
      if (selectedTeam) {
        state.selectedTeam = state.teamNameObject[selectedTeam]

        return getPostList()
      }

      return undefined
    })
}

async function getPostList() {
  const urls = {
    channels: SLACK_API.post + SLACK_API.channels_list,
    groups: SLACK_API.post + SLACK_API.groups_list,
    users: SLACK_API.post + SLACK_API.user_list
  }

  const form = {
    form: {
      "token": state.selectedTeam
    }
  }

  state.channelsList = []

  const postRequest = async ( url: string ) =>
    await request.post(url, form, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        const data = JSON.parse(body)

        if (data.channels) {
          state.channelsList = [
            ...state.channelsList,
            ...data.channels.map(( channel: Channel ) => 
              ({ id: channel.id, label: `#${channel.name}` })
            )
          ]
        }

        if (data.members) {
          state.channelsList = [
            ...state.channelsList,
            ...data.members.map(( member: Member ) => 
              ({ id: member.id, label: `@${ member.name }`, description: member.profile.real_name })
            )
          ]
        }

        if (data.groups) {
          state.channelsList = [
            ...state.channelsList,
            ...data.groups.map(( group: Group ) =>
              ({ id: group.id, label: `#${group.name}`, description: group.topic.value })
            )
          ]
        }
      }
    })

  await Promise.all(
    map(postRequest, Object.values(urls))
  ).catch((e: any) => console.log(e))

  await selectChannel()
}

async function selectChannel() {
  return vscode.window.showQuickPick(state.channelsList, {
    matchOnDescription: true,
    placeHolder: "Please select a channel"
  })
  .then(( selectedChannel ) => {
    if ( selectedChannel ) {
      state.selectedChannel = { ...selectedChannel }

      return sendData()
    }

    return undefined
  })
}

async function sendData() {
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

  const relativePath = vscode.workspace.asRelativePath(editor.document.uri)
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri)

  console.log('Workspace folder', workspaceFolder)

  // Adjust vscode filetypes to slack API
  let { adjustedFiletype, actualFilename, filename }: { adjustedFiletype?: string, actualFilename?: string, filename?: string } = {
    adjustedFiletype: undefined,
    actualFilename: undefined,
    filename: undefined
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

  let data: DataT = {
    "token": state.selectedTeam,
    "channels": (state.selectedChannel && state.selectedChannel.id) && state.selectedChannel.id,
    "content": text,
    "filename": filename,
    "filetype": adjustedFiletype,
    "title": relativePath === 'Untitled-1' ? `${filename} sent from VCSlack` : `${relativePath} sent from VCSlack`
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