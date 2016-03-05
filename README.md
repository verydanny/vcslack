# Visual Studio Code to Slack

## install

Open command palette ([Shift] + [cmmand] + [P]) and select "Extensions: Install Extension".  
Please type "VSlack" and click install button.

## setting
Open User Setting (File > Preferences > User Settings) and add 
````
"vslack.selfToken": [
    "your slack token 1",
    "your slack token 2",
    "your slack token 3"
],
````
- "your slack token 1"  (required)
    - You can get the token from https://api.slack.com/web#auth
- "your slack token 2 ~" (option)

## use
Open command palette ([Shift] + [cmmand] + [P]) and select "VSlack".  
Select Slack team and channel or user.  
Send current file or selected text as snnipets or plain text.