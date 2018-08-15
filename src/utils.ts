import * as vscode from 'vscode'

const statusBaritem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)

export const statusMaker = (message: string, timeout: number, icon?: string) => {
  statusBaritem.text = `$(${ icon ? icon : 'bell' }) ${ message }`
  statusBaritem.show()
  
  return setTimeout(() => statusBaritem.hide(), timeout)
}