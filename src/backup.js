
var SLACK_API_FILE_UP = "files.upload"
,SLACK_API_CHAT_POST = "chat.postMessage"
,SLACK_API_TEAM_INFO = "team.info"
,SLACK_API_GROUPS_LIST = "groups.list"
,SLACK_API_CHANNELS_LIST = "channels.list"
,SLACK_API_GROUP_LIST = "groups.list"
,SLACK_API_USER_LIST = "users.list"
;

var SLACK_POST_URL = 'https://slack.com/api/';



function activate(context) {

	var disposable = vscode.commands.registerCommand('extension.VSlack', function () {
        
        
        var config = vscode.workspace.getConfiguration('vslack');
        var myTokens = config['selfToken'];
        
        var teamNamesObj = {};
        var count = 0;
        for(var i = 0, len = myTokens.length; i < len; i++){
            let thisToken = myTokens[i];
            var sendData = {"token": thisToken};
            request.post(
                SLACK_POST_URL + SLACK_API_TEAM_INFO, 
                { form: sendData },
                function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        teamNamesObj[JSON.parse(body).team.name] = thisToken;
                        if(count < len - 1){
                            count++;
                        }else{
                            selectTeam(teamNamesObj);
                        }
                        
                    } else {
                        //vscode.window.showInformationMessage('VSlack error...');
                        if(count < len - 1){
                            count++;
                        }else{
                            selectTeam(teamNamesObj);
                        }
                    }   
                }   
            );
        }
        
        function selectTeam(){
            var options = {　placeHolder: "Which team do you send text or snippets?"　};
            vscode.window
            .showQuickPick(Object.keys(teamNamesObj), options)
            .then((selectedTeam) => {
                var myToken = teamNamesObj[selectedTeam];
                getPostList(myToken);
            });
        };
        
        function getPostList(token){
            var urls = [SLACK_POST_URL + SLACK_API_CHANNELS_LIST, SLACK_POST_URL + SLACK_API_GROUP_LIST, SLACK_POST_URL + SLACK_API_USER_LIST];
            var postObj = {};
            var counter = 0;
            urls.forEach(function(url){
                let postType = url == SLACK_POST_URL + SLACK_API_CHANNELS_LIST? 'channels':
                               url == SLACK_POST_URL + SLACK_API_GROUP_LIST? 'groups':
                               'members';
                let preName = url == SLACK_POST_URL + SLACK_API_CHANNELS_LIST? '#':
                               url == SLACK_POST_URL + SLACK_API_GROUP_LIST? '#':
                               '@';
                request.post(
                    url, 
                    { form: {"token": token} },
                    function (err, res, body) {
                        if (!err && res.statusCode == 200) {
                            JSON.parse(body)[postType].forEach(function(post){
                                postObj[preName + post.name] = post.id;
                            });
                            if(counter == 2){
                                selectChannel(token, postObj);
                            };
                            counter++;
                            
                        } else {
                            //vscode.window.showInformationMessage('VSlack error...');
                            console.log(body);
                            if(counter == 2){
                                selectChannel(token, postObj);
                            };
                            counter++;
                        }   
                    }   
                );
            });
            
        };
        
        function selectChannel(token, postObj){
            var options = {　placeHolder: "Plese select slack channel or user."　};
            vscode.window
            .showQuickPick(Object.keys(postObj), options)
            .then((selectedChannel) => {
                var myPostlId = postObj[selectedChannel];
                dataMake(token, myPostlId);
            });
        };
        
        function dataMake(token, channel){
            console.log(channel);
            //get text
            var editor = vscode.window.activeTextEditor,
                document = editor.document,
                selection = editor.selection,
                text = document.getText(selection),
                language = document.languageId,
                fileName = document.fileName;
                
            if(text == "") {
                text = document.getText();
            }
                
            var apiType = "files.upload";
            if(language == "plaintext"){
                apiType = "chat.postMessage";
            }
                
            
            // URL(slackAPI)
            var baseUrl = 'https://slack.com/api/'+ apiType;
            var data = {};
            if(apiType == "files.upload"){
                data = {
                            "token": token,
                            "title" : 'posted from VSlack',
                            "content": text,
                            "filetype": language,
                            "filename": 'posted from VSlack',
                            "mode" : "snippet",
                            "channels": channel
                        };
            }else{
                data = {
                            "token": token,
                            "channel": channel,
                            "text": text,
                            "as_user": true
                        };
            }
            
            postToSlack(data,baseUrl);
        }
        
        
        function postToSlack(data,baseUrl){
            //post data
            request.post(
                baseUrl, 
                { form: data },
                function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        // Display a message box to the user
                        vscode.window.showInformationMessage('"VSlack" is completed');
                        console.log(body);
                    } else {
                        vscode.window.showInformationMessage('"VSlack" error...');
                        console.log(body);
                    }   
                }   
            );
        }
        
        
	});
	
	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;