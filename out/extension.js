"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const request = require("request-promise");
const fp_1 = require("lodash/fp");
const SLACK_API = {
    post: "https://slack.com/api/",
    file_upload: "files.upload",
    api_chat_post: "chat.postMessage",
    team_info: "team.info",
    groups_list: "groups.list",
    channels_list: "channels.list",
    user_list: "users.list"
};
let state = {
    teamNameObject: {},
    selectedTeam: undefined,
    channelsList: [],
    selectedChannel: undefined
};
const statusBaritem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
const statusMaker = (message, timeout, icon) => {
    statusBaritem.text = `$(${icon ? icon : 'bell'}) ${message}`;
    statusBaritem.show();
    return setTimeout(() => statusBaritem.hide(), timeout);
};
function activate(context) {
    const config = vscode.workspace.getConfiguration('vcslack');
    // @ts-ignore
    let disposable = vscode.commands.registerCommand('extension.VCSlack', () => {
        const tokens = config.get('selfToken');
        let counter = 0;
        statusMaker('Fetching your teams...', 2000);
        tokens.forEach((token, index) => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(yield request.post(`${SLACK_API.post + SLACK_API.team_info}`, { form: { "token": token } }));
            if (data.team && data.team.name) {
                state.teamNameObject = Object.assign({}, state.teamNameObject, { [data.team.name]: token });
            }
            counter++;
            if (counter === tokens.length) {
                selectTeam();
            }
        }));
    });
}
exports.activate = activate;
function selectTeam() {
    const options = {
        placeHolder: "Which team/user would you like to send a snippet to?",
        ignoreFocusOut: false
    };
    const teamNames = Object.keys(state.teamNameObject);
    return vscode.window.showQuickPick(teamNames, options)
        .then((selectedTeam) => {
        if (selectedTeam) {
            if (!state.selectedTeam) {
                state.selectedTeam = state.teamNameObject[selectedTeam];
                return getPostList();
            }
            else if (state.selectedTeam === state.teamNameObject[selectedTeam]) {
                return state.channelsList.length > 1 ? selectChannel() : getPostList();
            }
            state.selectedTeam = state.teamNameObject[selectedTeam];
            return getPostList();
        }
        return undefined;
    });
}
function getPostList() {
    return __awaiter(this, void 0, void 0, function* () {
        const urls = {
            channels: SLACK_API.post + SLACK_API.channels_list,
            groups: SLACK_API.post + SLACK_API.groups_list,
            users: SLACK_API.post + SLACK_API.user_list
        };
        const form = {
            form: {
                "token": state.selectedTeam
            }
        };
        const postRequest = (url) => __awaiter(this, void 0, void 0, function* () {
            return yield request.post(url, form, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    const data = JSON.parse(body);
                    if (data.channels) {
                        state.channelsList = [
                            ...state.channelsList,
                            ...data.channels.map((channel) => ({ id: channel.id, label: `#${channel.name}` }))
                        ];
                    }
                    if (data.members) {
                        state.channelsList = [
                            ...state.channelsList,
                            ...data.members.map((member) => ({ id: member.id, label: `@${member.name}`, description: member.profile.real_name }))
                        ];
                    }
                    if (data.groups) {
                        state.channelsList = [
                            ...state.channelsList,
                            ...data.groups.map((group) => ({ id: group.id, label: `#${group.name}`, description: group.topic.value }))
                        ];
                    }
                }
            });
        });
        yield Promise.all(fp_1.map(postRequest, urls)).catch((e) => console.log(e));
        yield selectChannel();
    });
}
function selectChannel() {
    return vscode.window.showQuickPick(state.channelsList, {
        matchOnDescription: true,
        placeHolder: "Please select a channel"
    })
        .then((selectedChannel) => {
        state.selectedChannel = Object.assign({}, selectedChannel);
        sendData();
    });
}
function sendData() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        const selection = editor.selection;
        const filename = document.fileName;
        const filetype = document.languageId;
        const text = document.getText(selection) !== '' ? document.getText(selection) :
            document.getText() !== '' ? document.getText() : false;
        const data = {
            "token": state.selectedTeam,
            "title": "posted from VCSlack",
            "content": text,
            "filetype": filetype === 'plaintext' ? 'text' : filetype,
            "filename": filename ? filename : 'Untitled',
            "mode": "snippet",
            "channels": (state.selectedChannel && state.selectedChannel.id) && state.selectedChannel.id
        };
        return text ?
            yield request.post(SLACK_API.post + SLACK_API.file_upload, { form: data }, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    console.log(body);
                    vscode.window.showInformationMessage("Snippet sent!");
                }
                else {
                    vscode.window.showErrorMessage("Error, couldn't send snippet");
                }
            })
            :
                vscode.window.showWarningMessage("Warning: Your selection/document appears to be empty");
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map