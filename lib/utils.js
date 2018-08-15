"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const statusBaritem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
exports.statusMaker = (message, timeout, icon) => {
    statusBaritem.text = `$(${icon ? icon : 'bell'}) ${message}`;
    statusBaritem.show();
    return setTimeout(() => statusBaritem.hide(), timeout);
};
//# sourceMappingURL=utils.js.map