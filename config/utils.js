const { spawnSync, spawn } = require('child_process');
const fs = require('fs');

async function RunScript(command = '', args = [], logsUsername = 'dustbin', appname = 'dustbin', logToApp = false, cwd = '/home/tsadmin/deploys') {
    let completed = false
    //scriptLocation = "./test.py"
    if (logToApp == true && !fs.existsSync(`/home/tsadmin/deploys/${logsUsername}/${appname}/displicare-logs/`)) {
        await spawnSync('mkdir', [`displicare-logs/`], { shell: true, cwd: `/home/tsadmin/deploys/${logsUsername}/${appname}/` })
    }
    var process = await spawn(command, args, { shell: true, cwd: cwd });

    process.stdout.setEncoding('utf-8')
    process.stdout.on('data', function (data) {
        //fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}/displicare-logs/logs.txt`, data.toString());
        if (logToApp == true) {
            fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}/displicare-logs/logs.txt`, data.toString());
        }
        console.log('stdout: ' + data.toString());
    });

    process.stderr.setEncoding('utf-8')
    process.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
        //fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}/displicare-logs/logs.txt`, data.toString());
        if (logToApp == true) {
            fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}/displicare-logs/logs.txt`, data.toString());
        }
    });


    process.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
        if (logToApp == true) {
            fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}/displicare-logs/logs.txt`, 'process exited with code ' + code.toString());
            //fs.appendFileSync(`./test/${logsUsername}/${appname}/displicare-logs/logs.txt`, 'process exited with code ' + code.toString());
        }
        completed = true;
        //return true
    });
    if (completed == true) {
        return true;
    }
}

async function deployApp(appname, username, port, checkout = 'main') {
    console.log("deployAppInUtlisGotCalledWith", appname, username, port, checkout)
    let resp1 = await RunScript('sudo rm -rf', [`${appname}`], '', '', false, `/home/tsadmin/deploys/${username}/`);
    console.log("ran sudo rm")
    if (fs.existsSync(`/home/tsadmin/deploys/${username}`)) {
        await RunScript('sudo mkdir -p', [`${username}`], username, appname, true, `/home/tsadmin/deploys/`);
        console.log("ran sudo mkdir for username")
    }
    let resp2 = await RunScript('sudo git', ['clone', `/home/git/repositories/${appname}.git`], username, appname, true, `/home/tsadmin/deploys/${username}/`)
    console.log("ran sudo git clone")
    let resp3 = await RunScript('sudo mkdir', ['-p', `/home/tsadmin/deploys/${username}/${appname}/displicare-logs`], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}/`);
    console.log("ran sudo mkdir for displicare logs")
    let resp4 = await RunScript('sudo git', ['checkout', checkout], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}`)
    console.log("ran sudo git checkout on main")
    let resp5 = await RunScript('sudo npm', ['install'], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}`)
    console.log("ran sudo npm install")
    console.log(resp1, resp2, resp3, resp4, resp5)
    RunScript('PORT=' + port + " ", ["npm run start"], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}`)
    return true;
}

// RunScript('python',['./test.py'])

module.exports = { RunScript, deployApp }