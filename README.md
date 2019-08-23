# Visual Studio Code to Slack

## Features

- [x] Automatic sending of file/or highlighted text
- [x] Syntax Highlighting in Slack
- [x] Fast! Cached in VSCode on every load
- [x] Selection sending or whole document sending

## Install

Open command palette ([Shift] + [cmmand] + [P]) and select "Extensions: Install Extension".  
Please type "VCSlack" and click install button.

## Settings
Get a Slack [legacy token](https://api.slack.com/custom-integrations/legacy-tokens)

Open User Setting (File > Preferences > User Settings) and add  

````
"vcslack.selfToken": [
    "your slack legacy token 1",
    "your slack legacy token 2"
],
````

## Use
Open command palette ([Shift] + [cmmand] + [P]) and select "VCSlack".  
Select Slack team and channel or user.  
Send current file or selected text as snippets or plain text.
