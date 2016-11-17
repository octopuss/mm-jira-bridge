import request from 'request-promise-native';
import toMarkdown from 'to-markdown';
import {findHookId} from './hookFinder';

require('babel-polyfill');

export async function hookProcessor(req, res, next) {
    console.log("Received update from JIRA");
    let hookId = await findHookId(req.body);
    if (!hookId) {
        return res.end('hook not found');
    }
    let webevent = req.body.webhookEvent;
    let issueID = req.body.issue.key;
    let issueRestUrl = req.body.issue.self;
    let regExp = /(.*?)\/rest\/api\/.*/g;
    let matches = regExp.exec(issueRestUrl);
    let issueUrl = matches[1] + "/browse/" + issueID;
    let summary = req.body.issue.fields.summary;
    let displayName = req.body.user.displayName;
    let changeLog = req.body.changelog;
    let comment = req.body.comment;

    let postContent;

    if (webevent == "jira:issue_updated") {
        postContent = "##### " + displayName + " updated [" + issueID + "](" + issueUrl + "): " + summary;
    }
    else if (webevent == "jira:issue_created") {
        postContent = "##### " + displayName + " created [" + issueID + "](" + issueUrl + "): " + summary;
    }
    else if (webevent == "jira:issue_deleted") {
        postContent = "##### " + displayName + " deleted [" + issueID + "](" + issueUrl + "): " + summary;
    }
    else {
        console.log("Ignoring events which we don't understand");
        return;
    }

    if (changeLog) {
        let changedItems = req.body.changelog.items;

        postContent += "\r\n| Field | Updated Value |\r\n|:----- |:-------------|\r\n";

        for (i = 0; i < changedItems.length; i++) {
            let item = changedItems[i];
            let fieldName = item.field;
            let fieldValue = item.toString;
            if (!fieldValue) {
                fieldValue = "-Cleared-";
            }
            postContent += "| " + toTitleCase(doConversion(fieldName)) + " | " + doConversion(fieldValue) + " |\r\n";
        }
    }

    if (comment) {
        postContent += "\r\n##### Comment:\r\n" + doConversion(comment.body);
    }
    try {
        await postToServer(postContent, hookId);
        res.end("OK");
    } catch (err) {
        next(err);
    }
}

async function postToServer(postContent, hookid) {
    console.log("Informing mattermost channel: " + hookid);
    const matterUsername = process.env.MATTERMOST_USERNAME || 'JIRA';
    const matterIconUrl = process.env.MATTERMOST_ICON_URL || 'https://design.atlassian.com/images/logo/favicon.png';
    const postData = '{"text": ' + JSON.stringify(postContent) + ', "username": "' + matterUsername + '", "icon_url": "' + matterIconUrl + '"}';
    console.log("Calling " + process.env.MATTERMOST_SERVER);
    return await request.post(process.env.MATTERMOST_SERVER, {json: postData});
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function doConversion(str) {
    return toMarkdown(str);
}
