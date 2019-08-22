import * as vscode from 'vscode'
import phin from 'phin'
import { pipe, resolve, mapAsync } from 'rambdax'
import { getText, buildFilename } from './utils'

import {
  Team,
  Channel,
  ChannelList,
  DataT,
  Member,
  Group,
  SlackFileTypes
} from './types/vcslack'

export const SLACK_API = {
  post: 'https://slack.com/api/',
  fileUpload: 'files.upload',
  apiChatPost: 'chat.postMessage',
  teamInfo: 'team.info',
  groupsList: 'groups.list',
  channelsList: 'channels.list',
  userList: 'users.list'
}

export const fetchTeams = async (token: string) => {
  const form = { token: token }

  const data = await phin({
    url: `${SLACK_API.post + SLACK_API.teamInfo}`,
    form,
    method: 'POST',
    parse: 'json'
  })
    .then(res => res.body)
    .catch(e => vscode.window.showErrorMessage(e))

  if (data && data.team && data.team.name) {
    return {
      name: data.team.name,
      token: token
    }
  }

  return
}

const organizeUserInfo = (data: any) => {
  if (data) {
    if (data && data.channels) {
      return data.channels.map((channel: Channel) => ({
        id: channel.id,
        label: `#${channel.name}`
      }))
    }

    if (data.members) {
      return data.members.map((member: Member) => ({
        id: member.id,
        label: `@${member.name}`,
        description: member.profile.real_name
      }))
    }

    if (data.groups) {
      return data.groups.map((group: Group) => ({
        id: group.id,
        label: `#${group.name}`,
        description: group.topic.value
      }))
    }
  }
}

export const getPostList = async ({
  name,
  token
}: {
  name: string
  token: string
}) => {
  const channels = SLACK_API.post + SLACK_API.channelsList
  const groups = SLACK_API.post + SLACK_API.groupsList
  const users = SLACK_API.post + SLACK_API.userList
  const form = { token: token }

  return {
    name,
    token,
    channelList: (await Promise.all(
      [channels, groups, users].map(
        async url =>
          await phin({
            url,
            form,
            method: 'POST',
            parse: 'json'
          })
            .then(res => organizeUserInfo(res.body))
            .catch(e => {
              if (e) {
                vscode.window
                  .showErrorMessage(
                    `Error fetching ${url}, Report Issues: https://github.com/verydanny/vcslack/issues`,
                    'Copy Error To Clipboard'
                  )
                  .then(result => {
                    if (result === 'Copy Error To Clipboard') {
                      vscode.env.clipboard.writeText(`${url}, ${e.toString()}`)
                    }
                  })
              }
            })
      )
    )).flat()
  }
}

export const buildTeamData = pipe(
  mapAsync(fetchTeams),
  resolve(mapAsync(getPostList))
) as (x: any[]) => Promise<Team[]>

export const sendData = async (
  matchingChannel: ChannelList,
  { token }: Team
) => {
  if (!vscode.window.activeTextEditor) {
    return
  }

  const { selection, document } = vscode.window.activeTextEditor
  const { fileName: filenameWithPath, languageId: filetype } = document
  const content = getText(selection, document.getText)
  const channels =
    matchingChannel && matchingChannel.id ? matchingChannel.id : ''

  if (!content) {
    return vscode.window.showWarningMessage(
      'Warning: Your selection/document appears to be empty'
    )
  }

  const filedetails = buildFilename(
    filetype as keyof SlackFileTypes,
    filenameWithPath,
    document
  )

  const data: DataT = {
    token,
    channels,
    content,
    filename: filedetails.cleanedFilename,
    filetype: filedetails.slackCompatible,
    title: filedetails.path
      ? `${filedetails.path} sent from VCSlack`
      : `${filedetails.cleanedFilename} sent from VCSlack`
  }

  return phin({
    url: SLACK_API.post + SLACK_API.fileUpload,
    form: data,
    method: 'POST',
    parse: 'json'
  })
    .then(() => vscode.window.showInformationMessage('Snippet Sent Success!'))
    .catch(async e => {
      if (e) {
        vscode.window
          .showErrorMessage(
            'Error sending snippet, Report Issues: https://github.com/verydanny/vcslack/issues',
            'Copy Error To Clipboard'
          )
          .then(result => {
            if (result === 'Copy Error To Clipboard') {
              const error = {
                errorDetails: e.toString(),
                sendData: data,
                filedetails
              }

              vscode.env.clipboard.writeText(JSON.stringify(error))
            }
          })
      }
    })
}
