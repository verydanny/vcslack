# VSCode -> Slack

![How To Use](https://thumbs.gfycat.com/PoliteRadiantEft-size_restricted.gif)

You tired of copying your code then going to Slack to copy it only to realize that it doesn't automatically format code? That you have to manually push the little paperclip in the corner, select "Create new...", click on "Code or text snippet", then you have to paste, select the right format for your code because Slack's automatic code detection SUCKS?

Rejoice, there's a solution for you! Just highlight the code you want to send, bring up the Command Palette, type "VCSlack", pick your team and channel, all fuzzyfind searchable, and off you go! No need for your hands to leave the keyboard.

## Features

- 🔂 Automatic sending of file if nothing highlighted
- 🤟 Sends highlighted editor text
- 📍 Shows the workspace and relative path of file so your coworkers can find it
- 🧠 Syntax Detection and syntax normalization for Slack
- 🔥 Fast! Cached in VSCode on every load
- 🕺💃🧚‍♀️ Support for multiple Slack teams

## Installation

1. Open command palette ([Shift] + [CMD(⌘)/Ctrl] + [P])
2. select "Extensions: Install Extension".  
3. Type "VCSlack" and click install button.

## Settings

To add your team(s):

1. Get a Slack [legacy token](https://api.slack.com/custom-integrations/legacy-tokens)
2. Open User Setting (File > Preferences > User Settings or [CMD(⌘)/Ctrl] + [,])
3. Search for "VCSlack"
4. Click "Edit in settings.json"
5. Add tokens in following format:

```json
"vcslack.selfToken": [
    "xoxp-3915.....",
    "xoxp-69420....",
],
```

## Using VCSlack

1. Have an open document
2. Highlight the text you wish to send, if nothign is highlighted, it will send entire document
3. Open command palette (Open command palette ([Shift] + [CMD(⌘)/Ctrl] + [P])
4. Type "VCSlack"
5. Select Slack team then channel or user
6. It will send the snippet and automatically attempt to deduce the language, if it fails, it will send as plain text
