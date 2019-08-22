import * as vscode from 'vscode'
import { filetypeMap } from './const'
import { SlackFileTypes, FileType } from './types/vcslack'

export const getText = (
  selection: vscode.Selection,
  fn: vscode.TextDocument['getText']
) => {
  const text = fn(selection)
  const allText = fn()

  if (text !== '') {
    return text
  } else if (allText !== '') {
    return allText
  }

  return undefined
}

const cleanFiletype = (filetype: keyof SlackFileTypes): FileType => {
  if (filetypeMap[filetype]) {
    return filetypeMap[filetype]
  }

  return {
    slackCompatible: filetype
  }
}

const cleanFilename = (filename: string) => {
  if (filename.indexOf('\\') !== -1) {
    return filename.substring(filename.lastIndexOf('\\') + 1)
  }

  return filename.substring(filename.lastIndexOf('/') + 1)
}

export const buildFilename = (
  filetype: keyof SlackFileTypes,
  filepath: string,
  document: vscode.TextDocument
) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
  const relativePath = vscode.workspace.asRelativePath(document.uri)
  const cleanedFiletype = cleanFiletype(filetype)
  const cleanedFilename = cleanFilename(filepath)

  if (workspaceFolder) {
    if (workspaceFolder.name) {
      return {
        path: `${workspaceFolder.name}/${relativePath}`,
        cleanedFilename,
        ...cleanedFiletype
      }
    }

    return {
      path: `${relativePath}`,
      cleanedFilename,
      ...cleanedFiletype
    }
  }

  return {
    path: undefined,
    cleanedFilename,
    ...cleanedFiletype
  }
}
