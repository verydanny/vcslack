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

interface State {
  teamNameObject: {
    [key: string]: string
  },
  selectedTeam?: string,
  channelsList: string[],
  selectedChannel?: Object
}

let state: State = {
  teamNameObject: {

  },
  selectedTeam: undefined,
  channelsList: [],
  selectedChannel: undefined
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('vcslack')

  // @ts-ignore
  let disposable = vscode.commands.registerCommand('extension.VCSlack', () => {
    const tokens: string[] = config.get('selfToken')
    let counter: number = 0

    vscode.window.showInformationMessage("Please wait, loading all Slack teams")
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
  const options = { placeHolder: "Which team/user would you like to send a snippet to?" }
  const teamNames = Object.keys( state.teamNameObject )

  vscode.window.showQuickPick(teamNames, options)
    .then(( selectedTeam ) => {
      vscode.window.showQuickPick([], {
        placeHolder: `Please wait: Loading team ${ selectedTeam }`
      })

      if (!state.selectedTeam) {
        state.selectedTeam = state.teamNameObject[ selectedTeam ]

        return getPostList()
      } else if (state.selectedTeam === state.teamNameObject[selectedTeam]) {
        return state.channelsList.length > 1 ? selectChannel() : getPostList()
      }
      
      state.selectedTeam = state.teamNameObject[selectedTeam]
      return getPostList()
    })
}

function getPostList() {
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

  let counter = 0

  map(url => {
    request.post(url, form, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        const data = JSON.parse(body)

        if (data.channels) {
          state.channelsList = [
            ...state.channelsList,
            ...data.channels.map(( channel: any ) => 
              ({ id: channel.id, label: `#${channel.name}` })
            )
          ]
        }

        if (data.members) {
          state.channelsList = [
            ...state.channelsList,
            ...data.members.map(( member: any ) => 
              ({ id: member.id, label: `@${ member.name }`, description: member.profile.real_name })
            )
          ]
        }

        if (data.groups) {
          state.channelsList = [
            ...state.channelsList,
            ...data.groups.map(( group: any ) =>
              ({ id: group.id, label: `#${group.name}`, description: group.topic.value })
            )
          ]
        }
      }

      counter++

      if (counter === Object.keys(urls).length) {
        selectChannel()
      }
    })
  }, urls)
}

function selectChannel() {
  console.log(state)
  return vscode.window.showQuickPick(state.channelsList, {
    matchOnDescription: true,
    placeHolder: "Please select a channel"
  })
  .then(( selectedChannel: Object ) => {
    state.selectedChannel = { ...selectedChannel }

    sendData()
  })
}

function sendData() {
  const editor = vscode.window.activeTextEditor
  const document = editor.document

  console.log(document)
}

exports.activate = activate