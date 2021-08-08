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
    await RunScript('sudo rm', ['-r', '-f', `${appname}`], '', '', false, `/home/tsadmin/deploys/${username}/`);
    if (fs.existsSync(`/home/tsadmin/deploys/${username}`)) {
        await RunScript('sudo mkdir', [`${username}`], username, appname, true, `/home/tsadmin/deploys/`);
    }
    await RunScript('sudo git', ['clone', `/home/git/repositories/${appname}.git`], username, appname, true, `/home/tsadmin/deploys/${username}/`)
    await RunScript('sudo mkdir', [`displicare-logs`], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}/`);
    await RunScript('sudo git', ['checkout', checkout], username, appname, true, `/home/tsadmin/deploys/${username}/`)
    await RunScript('npm', ['install'], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}`)
    RunScript('PORT=' + port + " ", ["npm start"], username, appname, true, `/home/tsadmin/deploys/${username}/${appname}`)
    return true;
}

// RunScript('python',['./test.py'])

module.exports = { RunScript, deployApp }