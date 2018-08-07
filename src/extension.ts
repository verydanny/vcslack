import * as vscode from "vscode"
import * as request from "request-promise"
import { map } from "lodash/fp"

const SLACK_API = {
  post: "https://slack.com/api/",
  file_upload: "files.upload",
  api_chat_post: "chat.postMessage",
  team_info: "team.info",
  groups_list: "groups.list",
  channels_list: "channels.list",
  user_list: "users.list"
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

const statusBaritem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)

const statusMaker = (message: string, timeout: number, icon?: string) => {
  statusBaritem.text = `$(${ icon ? icon : 'bell' }) ${ message }`
  statusBaritem.show()
  
  return setTimeout(() => statusBaritem.hide(), timeout)
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('vcslack')

  vscode.commands.registerCommand('extension.VCSlack', () => {
    const tokens: string[] = config.get('selfToken')
    let counter: number = 0

    statusMaker('Fetching your teams...', 2000)

    tokens.forEach( async ( token, index ) => {
      const data = JSON.parse( await request.post(
        `${ SLACK_API.post + SLACK_API.team_info}`,
        { form: { "token": token } },
      ))

      if (data.team && data.team.name) {
        state.teamNameObject = {
          ...state.teamNameObject,
          [data.team.name]: token
        }
      }

      counter++
      if ( counter === tokens.length ) {
        selectTeam()
      }
    })
  })
}

function selectTeam() {
  const options = {
    placeHolder: "Which team/user would you like to send a snippet to?",
    ignoreFocusOut: false
  }
  const teamNames = Object.keys( state.teamNameObject )

  return vscode.window.showQuickPick(teamNames, options)
    .then(( selectedTeam ) => {
      if (selectedTeam) {
        if (!state.selectedTeam) {
          state.selectedTeam = state.teamNameObject[ selectedTeam ]
          return getPostList()
        } else if (state.selectedTeam === state.teamNameObject[selectedTeam]) {
          return state.channelsList.length > 1 ? selectChannel() : getPostList()
        }

        state.selectedTeam = state.teamNameObject[ selectedTeam ]
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
    map( postRequest, urls )
  ).catch((e) => console.log(e))

  await selectChannel()
}

function selectChannel() {
  return vscode.window.showQuickPick(state.channelsList, {
    matchOnDescription: true,
    placeHolder: "Please select a channel"
  })
  .then(( selectedChannel ) => {
    state.selectedChannel = { ...selectedChannel }

    sendData()
  })
}

async function sendData() {
  const editor = vscode.window.activeTextEditor
  const document = editor.document
  const selection = editor.selection
  const filename = document.fileName
  const filetype = document.languageId
  const text = document.getText(selection) !== '' ? document.getText(selection) :
    document.getText() !== '' ? document.getText() : false

  const data = {
    "token": state.selectedTeam,
    "title": "posted from VCSlack",
    "content": text,
    "filetype": filetype === 'plaintext' ? 'text' : filetype,
    "filename": filename ? filename : 'Untitled',
    "mode": "snippet",
    "channels": (state.selectedChannel && state.selectedChannel.id) && state.selectedChannel.id
  }

  return text ?
    await request.post(
      SLACK_API.post + SLACK_API.file_upload,
      { form: data },
      (err, res, body) => {
        if (!err && res.statusCode == 200) {
          console.log(body)
          vscode.window.showInformationMessage("Snippet sent!")
        } else {
          vscode.window.showErrorMessage("Error, couldn't send snippet")
        }
      }
    )
    :
    vscode.window.showWarningMessage("Warning: Your selection/document appears to be empty")
}

exports.activate = activate