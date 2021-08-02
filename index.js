const admin = require('./firebase')
const db = admin.firestore();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
const { RunScript } = require('./config/utils')
const { AddGitoliteRepoWithUser, AddGitoliteUser, RemoveGitoliteUser, ChangeGitoliteUser } = require('./models/GitoliteUpdate')
const { UpdateNginxWithDeploy } = require('./models/NginxUpdate')


const userCollection = db.collection('users');
const repoCollection = db.collection('repos');

const gitoliteConfigFile = '/home/tsadmin/gitolite-admin'

let scheduledRepoAddArray = [];

let scheduledRepoDeployArray = [];

let scheduledUserAddArray = [];

let scheduledUserRemoveArray = [];

let scheduledUserChangeArray = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/schedule-repo-add', async (req, res) => {
    let reponame = req.body.reponame
    let owner = req.body.owner
    let port = req.body.port
    scheduledRepoAddArray.push({ reponame: reponame, owner: owner, port: port })
    res.send({message:"scheduled successfully"})
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
    res.send("hello")
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
        for (const element of scheduledRepoAddArray) {
            await AddGitoliteRepoWithUser(element.reponame, element.owner, [{ username: 'gamer1478', perms: 'own' }], gitoliteConfigFile)
            await UpdateNginxWithDeploy(element.reponame, element.port)
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