const admin = require('./firebase')
const db = admin.firestore();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
const { RunScript } = require('./config/utils')
const { AddGitoliteRepoWithUser, AddGitoliteUser, RemoveGitoliteUser, ChangeGitoliteUser } = require('./models/GitoliteUpdate')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate')
var bodyParser = require('body-parser')


const userCollection = db.collection('users');
const repoCollection = db.collection('repos');

const gitoliteConfigFile = '/home/tsadmin/gitolite-admin'

let scheduledRepoAddArray = [];

let scheduledRepoDeployArray = [];

let scheduledUserAddArray = [];

let scheduledUserRemoveArray = [];

let scheduledUserChangeArray = [];

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
    res.send(JSON.stringify({message:"successfully scheduled"}))
})

app.post('/schedule-repo-deploy', async (req, res) => {
    let reponame = req.body.reponame
    let data = await repoCollection.doc(reponame).get()
    data = data.data()
    let port = parseInt(data.port)
    let username = data.owner
    scheduledRepoDeployArray.push({ reponame: reponame, port: port, username: username })
    res.send({message:"scheduled successfully"})
})

app.post('/schedule-repo-delete', async (req, res) => {
    let reponame = req.body.reponame
    res.send({ "message": "repo delete scheduler is on maintainence, call again later." })
    res.send({message:"scheduled successfully"})
})

app.post('/schedule-user-add', async (req, res) => {
    let username = req.body.username
    let key = req.body.pub_key

    scheduledUserAddArray.push({ username: username, key: key })
    res.send({message:"scheduled successfully"})
})

app.post('/schedule-user-delete', async (req, res) => {
    let username = req.body.username

    scheduledUserRemoveArray.push({ username: username })
    res.send({message:"scheduled successfully"})

})

app.post('/schedule-user-change', async (req, res) => {
    let username = req.body.username
    let key = req.body.pub_key

    scheduledUserChangeArray.push({ username: username, key: key })
    res.send({message:"scheduled successfully"})

})

app.get('/', async (req, res) => {
    console.log("console.log is working atleast")
    let resp = AddGitoliteRepoWithUser("test", "gamer1478", [{ username: 'gamer1478', perms: 'own' }], gitoliteConfigFile)
    console.log(await resp)
    res.send(await resp)
})

const scheduleRepoDeploy = async function () {
    if (scheduledRepoDeployArray.length != 0) {
        for (const element of scheduledRepoDeployArray) {
            RunScript("python", ['./models/deploy.py', element.reponame, element.port, element.username])
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
            let resp = await AddGitoliteRepoWithUser(element.reponame, element.owner, [{ username: 'gamer1478', perms: 'own' }], gitoliteConfigFile)
            let resp1 = await UpdateNginxWithDeploy(element.reponame, element.port)
            console.log(await resp, await resp1)
            var index = scheduledRepoAddArray.indexOf(element);
            if (index > -1) {
                scheduledRepoAddArray.splice(index, 1);
            }
            console.log(scheduledRepoAddArray)
        }
    }
}

const scheduleUserKeyRemove = async function () {
    if (scheduledUserRemoveArray.length != 0) {
        for (const element of scheduledUserRemoveArray) {
            await RemoveGitoliteUser(element.username, element.key, gitoliteConfigFile)
            var index = scheduledUserRemoveArray.indexOf(element);
            if (index > -1) {
                scheduledUserRemoveArray.splice(index, 1);
            }
            console.log(scheduledUserRemoveArray)
        }
    }
}

const scheduleUserKeyAdd = async function () {
    if (scheduledUserAddArray.length != 0) {
        for (const element of scheduledUserAddArray) {
            await AddGitoliteUser(element.username, element.key, gitoliteConfigFile)
            var index = scheduledUserAddArray.indexOf(element);
            if (index > -1) {
                scheduledUserAddArray.splice(index, 1);
            }
            console.log(scheduledUserAddArray)
        }
    }

}

const scheduleUserKeyChange = async function () {
    if (scheduledUserChangeArray.length != 0) {
        for (const element of scheduledUserChangeArray) {
            await ChangeGitoliteUser(element.username, element.key, gitoliteConfigFile)
            var index = scheduledUserChangeArray.indexOf(element);
            if (index > -1) {
                scheduledUserChangeArray.splice(index, 1);
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

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})