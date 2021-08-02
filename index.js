const admin = require('./firebase')
const db = admin.firestore();
const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const path = require('path')
const {RunScript} = require('./config/utils')

const userCollection = db.collection('users');
const repoCollection = db.collection('repos');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

RunScript("python", ["./gitolite/init.py"])

app.post('/schedule-repo-add', async (req, res) => {
    let reponame = req.body.reponame
    let owner = req.body.owner

})

app.post('/schedule-repo-deploy', async (req, res) => {
    let reponame = req.body.reponame
})

app.post('/schedule-repo-delete', async (req, res) => {
    let reponame = req.body.reponame
})

app.post('/schedule-user-add', async (req, res) => {
    let username = req.body.username
    let key = req.body.pub_key

})

app.post('/schedule-user-delete', async (req, res) => {
    let username = req.body.username
})

app.listen(port, () => {
    console.log(`app most likely listening at http://localhost:${port}, If not you are in production.`)
})