"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const request = require("request");
const fp_1 = require("lodash/fp");
const SLACK_API = {
    post: "https://slack.com/api/",
    file_upload: "files.upload",
    api_chat_post: "chat.postMessage",
    team_info: "team.info",
    groups_list: "groups.list",
    channels_list: "channels_list",
    user_list: "users.list"
};
let state = {
    teamNameObject: {},
    selectedTeam: undefined
};
function activate(context) {
    const config = vscode.workspace.getConfiguration('vcslack');
    let disposable = vscode.commands.registerCommand('extension.VCSlack', () => {
        const tokens = config.get('selfToken');
        tokens.forEach((token, index) => {
            request.post(`${SLACK_API.post + SLACK_API.team_info}`, { form: { "token": token } }, (err, response, body) => {
                if (!err && response.statusCode == 200) {
                    const data = JSON.parse(body);
                    if (data.team && data.team.name) {
                        state.teamNameObject[data.team.name] = token;
                        if (index === tokens.length - 1) {
                            selectTeam();
                        }
                    }
                }
            });
        });
    });
    return disposable;
}
exports.activate = activate;
function selectTeam() {
    const options = { placeHolder: "Which team/user would you like to send a snipper to?" };
    const teamNames = Object.keys(state.teamNameObject);
    vscode.window.showQuickPick(teamNames, options)
        .then((selectedTeam) => {
        vscode.window.showQuickPick([], {
            placeHolder: `Please wait: Loading team ${selectedTeam}`
        });
        state.selectedTeam = state.teamNameObject[selectedTeam];
        getPostList();
    });
}
function getPostList() {
    const urls = {
        channels: SLACK_API.post + SLACK_API.channels_list,
        groups: SLACK_API.post + SLACK_API.groups_list,
        users: SLACK_API.post + SLACK_API.user_list
    };
    console.log(fp_1.map(x => console.log(x), urls));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map