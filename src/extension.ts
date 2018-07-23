import * as vscode from "vscode"
import * as request from "request"

const SLACK_API = {
  post: "https://slack.com/api/",
  file_upload: "files.upload",
  api_chat_post: "chat.postMessage",
  team_info: "team.info",
  groups_list: "groups.list",
  channels_list: "channels_list",
  user_list: "users.list"
}

interface State {
  teamNameObject: {
    [key: string]: string
  },
  selectedTeam?: string
}

let state: State = {
  teamNameObject: {

  },
  selectedTeam: undefined
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('vcslack')

  let disposable = vscode.commands.registerCommand('extension.VCSlack', () => {
    const tokens: string[] = config.get('selfToken')

    tokens.forEach(( token, index ) => {
      request.post(`${ SLACK_API.post + SLACK_API.team_info}`,
        { form: { "token": token } },
        ( err, response, body ) => {
          if (!err && response.statusCode == 200) {
            const data = JSON.parse(body)

            if (data.team && data.team.name) {
              state.teamNameObject[data.team.name] = token
            }

            if ( index === tokens.length - 1 ) {
              selectTeam()
            }
          }
        }
      )
    })
  })

  return disposable
}

function selectTeam() {
  const options = { placeHolder: "Which team/user would you like to send a snipper to?" }
  const teamNames = Object.keys( state.teamNameObject )

  vscode.window.showQuickPick(teamNames, options)
    .then(( selectedTeam ) => {
      state.selectedTeam = state.teamNameObject[ selectedTeam ]

      getPostList()
    })
}

function getPostList() {
  
}

exports.activate = activate