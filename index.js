const admin = require('./firebase')
const db = admin.firestore();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
const { RunScript, deployApp } = require('./config/utils')
const { AddGitoliteRepoWithUser, AddGitoliteUser, RemoveGitoliteUser, ChangeGitoliteUser } = require('./models/GitoliteUpdate')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate')


const userCollection = db.collection('users');
const repoCollection = db.collection('repos');

const gitoliteConfigFile = '/home/tsadmin/gitolite-admin/conf/gitolite.conf'
const gitoliteKeyDir = '/home/tsadmin/gitolite-admin/keydir'

let scheduledRepoAddArray = [];

let scheduledRepoDeployArray = [];

let scheduledUserAddArray = [];

let scheduledUserRemoveArray = [];

let scheduledUserChangeArray = [];

let LOCK_GITOLITE_ADMIN = false;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.post('/schedule-repo-add', async (req, res) => {
    console.log("body", req.body, "query", req.query)
    let reponame = await req.body.reponame
    let owner = await req.body.owner
    let port = await req.body.port
    scheduledRepoAddArray.push({ reponame: await reponame, owner: await owner, port: await port })
    console.log(scheduledRepoAddArray, "someone called repo add scheduler")
    console.log("god called, someone finnaly reported, i hope")
    res.send(JSON.stringify({ message: "successfully scheduled" }))
})

app.post('/schedule-repo-deploy', async (req, res) => {
    let reponame = req.body.reponame
    let data = await repoCollection.doc(reponame).get()
    data = data.data()
    let port = parseInt(data.port)
    let username = data.owner
    scheduledRepoDeployArray.push({ reponame: reponame, port: port, username: username })
    res.send({ message: "scheduled successfully" })
})

app.post('/schedule-repo-delete', async (req, res) => {
    let reponame = req.body.reponame
    res.send({ "message": "repo delete scheduler is on maintainence, call again later." })
    res.send({ message: "scheduled successfully" })
})

app.post('/schedule-user-add', async (req, res) => {
    console.log("body", req.body, "query", req.query)

    let username = req.body.username
    let key = req.body.pub_key

    scheduledUserAddArray.push({ username: username, key: key })
    res.send({ message: "scheduled successfully" })
})

app.post('/schedule-user-delete', async (req, res) => {
    let username = req.body.username

    scheduledUserRemoveArray.push({ username: username })
    res.send({ message: "scheduled successfully" })

})

app.post('/schedule-user-change', async (req, res) => {
    let username = req.body.username
    let key = req.body.pub_key

    scheduledUserChangeArray.push({ username: username, key: key })
    res.send({ message: "scheduled successfully" })

})

app.get('/', async (req, res) => {
    res.send("hello world, you weren't suppose to find this though!!")
})

const scheduleRepoDeploy = async function () {
    if (scheduledRepoDeployArray.length != 0) {
        console.log(scheduledRepoDeployArray)
        for (const element of scheduledRepoDeployArray) {
            deployApp(element.reponame, element.username, element.port, 'main')
            // RunScript("python3", ['./models/deploy.py', element.reponame, element.port, element.username], element.username, element.reponame, true)
            var index = scheduledRepoDeployArray.indexOf(element);
            if (index > -1) {
                scheduledRepoDeployArray.splice(index, 1);
            }
            console.log(scheduledRepoDeployArray)
        }
    }
}

const scheduleRepoAdd = async function () {
    if (scheduledRepoAddArray.length != 0) {
        console.log("got a repo to push, don't disturb me i have work!")
        for (const element of scheduledRepoAddArray) {
            console.log(scheduledRepoAddArray)
            let reponame = element.reponame;
            let logsUsername = element.owner;
            let resp = await AddGitoliteRepoWithUser(reponame, logsUsername, [{ username: 'gamer1478', perms: 'own' }], gitoliteConfigFile)
            let resp1 = await UpdateNginxWithDeploy(reponame, element.port)
            console.log(resp, resp1)
            var index = scheduledRepoAddArray.indexOf(element);
            if (index > -1) {
                scheduledRepoAddArray.splice(index, 1);
                if (scheduledRepoAddArray.isEmpty()) {
                    if (LOCK_GITOLITE_ADMIN == false) {
                        LOCK_GITOLITE_ADMIN = true;
                        let statusexit = await RunScript("sudo bash", ['./gitolite/push.sh'], logsUsername, reponame, true);
                        if (statusexit == true) {
                            LOCK_GITOLITE_ADMIN = false
                        }
                        console.log("finished pushing changes to gitolite")
                    }
                }
            }
            console.log(scheduledRepoAddArray)
        }
    }
}

const scheduleUserKeyRemove = async function () {
    if (scheduledUserRemoveArray.length != 0) {
        for (const element of scheduledUserRemoveArray) {
            console.log(element)
            await RemoveGitoliteUser(element.username, gitoliteKeyDir)
            var index = scheduledUserRemoveArray.indexOf(element);
            if (index > -1) {
                scheduledUserRemoveArray.splice(index, 1);
                if (scheduledUserRemoveArray.isEmpty()) {
                    if (LOCK_GITOLITE_ADMIN == false) {
                        LOCK_GITOLITE_ADMIN = true;
                        let statusexit = await RunScript("sudo bash", ['./gitolite/push.sh'], logsUsername, reponame, true);
                        if (statusexit == true) {
                            LOCK_GITOLITE_ADMIN = false
                        }
                    }
                }
            }
            console.log(scheduledUserRemoveArray)
        }
    }
}

const scheduleUserKeyAdd = async function () {
    if (scheduledUserAddArray.length != 0) {
        console.log(scheduledUserAddArray)
        for (const element of scheduledUserAddArray) {
            console.log(element)
            await AddGitoliteUser(element.username, element.key, gitoliteKeyDir)
            var index = scheduledUserAddArray.indexOf(element);
            if (index > -1) {
                scheduledUserAddArray.splice(index, 1);
                if (scheduledUserAddArray.isEmpty()) {
                    if (LOCK_GITOLITE_ADMIN == false) {
                        LOCK_GITOLITE_ADMIN = true;
                        let statusexit = await RunScript("sudo bash", ['./gitolite/push.sh'], logsUsername, reponame, true);
                        if (statusexit == true) {
                            LOCK_GITOLITE_ADMIN = false
                        }
                        console.log("finished pushing changes to gitolite")
                    }
                }
            }
            console.log(scheduledUserAddArray)
        }
    }

}

const scheduleUserKeyChange = async function () {
    if (scheduledUserChangeArray.length != 0) {
        for (const element of scheduledUserChangeArray) {
            console.log(element)
            await ChangeGitoliteUser(element.username, element.key, gitoliteKeyDir)
            var index = scheduledUserChangeArray.indexOf(element);
            if (index > -1) {
                scheduledUserChangeArray.splice(index, 1);
                if (scheduledUserChangeArray.isEmpty()) {
                    if (LOCK_GITOLITE_ADMIN == false) {
                        LOCK_GITOLITE_ADMIN = true;
                        let statusexit = await RunScript("sudo bash", ['./gitolite/push.sh'], logsUsername, reponame, true);
                        if (statusexit == true) {
                            LOCK_GITOLITE_ADMIN = false
                        }
                    }
                    console.log("finished pushing changes to gitolite")
                }
            }
            console.log(scheduledUserChangeArray)
        }
    }
}

setInterval(scheduleRepoAdd, 10000);

setInterval(scheduleRepoDeploy, 10000);

setInterval(scheduleUserKeyRemove, 10000);

setInterval(scheduleUserKeyAdd, 10000);

setInterval(scheduleUserKeyChange, 10000);

setInterval(function () {
    if (LOCK_GITOLITE_ADMIN == false) {
        LOCK_GITOLITE_ADMIN = true;
        let statusexit = await RunScript("sudo bash", ['./gitolite/push.sh'], logsUsername, reponame, true);
        if (statusexit == true) {
            LOCK_GITOLITE_ADMIN = false
        }
    }
    console.log("finished pushing changes to gitolite")
}, 5 * 60 * 1000);

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})