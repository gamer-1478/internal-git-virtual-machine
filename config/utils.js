const { spawnSync, spawn } = require('child_process');
const fs = require('fs');

async function RunScript(command = '', args = [], logsUsername = 'dustbin', appname = 'dustbin', logToApp = false, cwd = '/home/tsadmin/deploys') {
    if (logToApp == true && !fs.existsSync(`/home/tsadmin/deploys/${logsUsername}/${appname}.txt`)) {
        spawnSync('touch', [`${appname}.txt`], { shell: true, cwd: `/home/tsadmin/deploys/${logsUsername}/` })
    }

    var process = await spawn(command, args, { shell: true, cwd: cwd });

    process.stdout.setEncoding('utf-8')
    process.stdout.on('data', function (data) {
        if (logToApp == true) {
            fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}.txt`, data.toString());
        }
        console.log('stdout: ' + data.toString());
    });

    process.stderr.setEncoding('utf-8')
    process.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
        if (logToApp == true) {
            fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}.txt`, data.toString());
        }
    });


    process.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
        if (logToApp == true) {
            fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}.txt`, 'process exited with code ' + code.toString());
        }
        return true
    });
}

async function deployApp(appname, username, port, checkout = 'main') {

    fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}.txt`, "");
    fs.appendFileSync(`/home/tsadmin/deploys/${logsUsername}/${appname}.json`, JSON.stringify({ appname: appname, port: port, checkout: checkout, username: username, pid: 0 }));

    RunScript('python3', ['deploy.py', appname, port, username, checkout], username, appname, true, '/home/tsadmin/internal-git-virtual-machine/models')
    return true
}

// RunScript('python',['./test.py'])

module.exports = { RunScript, deployApp }