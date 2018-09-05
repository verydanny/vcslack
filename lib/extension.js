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
const utils_1 = require("./utils");
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
function reloadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const NEW_CONFIG = vscode.workspace.getConfiguration('vcslack');
        const NEW_TOKENS = NEW_CONFIG.get('selfToken');
        utils_1.statusMaker("Fetching New Teams", 500);
        delete state.teamNameObject;
        function fetchTeams(token) {
            return __awaiter(this, void 0, void 0, function* () {
                const form = { form: { "token": token } };
                const data = JSON.parse(yield request.post(`${SLACK_API.post + SLACK_API.team_info}`, form));
                if (data.team && data.team.name) {
                    state.teamNameObject = Object.assign({}, state.teamNameObject, { [data.team.name]: token });
                }
            });
        }
        yield Promise.all(fp_1.map(fetchTeams, NEW_TOKENS)).catch((e) => console.log(e));
    });
}
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('vcslack');
        const tokens = config.get('selfToken');
        utils_1.statusMaker("Fetching Teams", 500);
        yield Promise.all(fp_1.map(fetchTeams, tokens)).catch((e) => console.log(e));
        context.subscriptions.push(vscode.commands.registerCommand('vcslack.sendSnippet', () => selectTeam()), vscode.workspace.onDidChangeConfiguration(() => reloadConfig()));
    });
}
exports.activate = activate;
function fetchTeams(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const form = { form: { "token": token } };
        const data = JSON.parse(yield request.post(`${SLACK_API.post + SLACK_API.team_info}`, form));
        if (data.team && data.team.name) {
            state.teamNameObject = Object.assign({}, state.teamNameObject, { [data.team.name]: token });
        }
    });
}
function selectTeam() {
    const options = {
        placeHolder: "Which team/user would you like to send a snippet to?",
        ignoreFocusOut: false
    };
    const teamNames = Object.keys(state.teamNameObject);
    return vscode.window.showQuickPick(teamNames, options)
        .then((selectedTeam) => {
        if (selectedTeam) {
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
        state.channelsList = [];
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
        if (selectedChannel) {
            state.selectedChannel = Object.assign({}, selectedChannel);
            return sendData();
        }
        return undefined;
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
//# sourceMappingURL=extension.js.map