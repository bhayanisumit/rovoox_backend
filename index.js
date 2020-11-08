const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
let CORS = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const http = require('http');

const app = express();
app.use(CORS());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }));

const token = require('./service/token');
const verifyToken = require('./verifyToken');
const user = require('./model/user');
const userplaylog = require('./model/userplaylogs');
const config = require('./config-url');
const BONUS_VALUE = 10;
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// 1. /now - api
app.get('/now', (req, res) => {
    let dateTime = new Date()
    return res.status(200).send({ 'status': 1, 'SERVER_DATE_TIME': dateTime });
})

// 2. /register - api
app.post('/register', async (req, res) => {
    let r = Math.random().toString(36).substring(7);
    const checkUser = await user.findOne({ 'username': r }).exec();
    if (checkUser) return res.status(200).send({ 'status': 0, 'message': 'Already register this user' });
    let cu = new user();
    cu.username = r;
    cu.save((err, result) => {
        if (err) res.status(200).send({ 'status': 0, 'message': 'Error in save username', data: err });
        return res.status(200).send({ 'status': 1, 'message': 'User saved Successfully', 'AccessToken': token.getAccessToken(r), 'username': r });
    })
})

// 3. /me - api
app.get('/me', verifyToken, async (req, res) => {
    if (!req.query) return res.status(200).send({ 'status': 0, 'message': 'please enter name' });
    if (Object.keys(req.query)[0] == 'name') {
        const userData = await user.findOne({ 'username': req.query.name }).exec();
        return (userData) ? res.status(200).send({ 'status': 1, 'message': 'User data', data: userData }) : res.status(200).send({ 'status': 0, 'message': 'No user found' });
    } else {
        return res.status(200).send({ 'status': 0, 'message': 'Query key dose not match.please provide key name : name' });
    }
})


// 4. /game/play - api
app.post('/game/play', verifyToken, async (req, res) => {
    const randomNo = Math.floor(Math.random() * 101);
    const userData = await user.findOne({ 'username': req.userName }).exec();
    userData.points_total += randomNo;
    userData.save(async (err, result) => {
        if (err) return res.status(200).send({ 'status': 0, 'message': 'Error in save User score', data: err });
        const up = await userplaylog.findOne({ 'username': req.userName }).exec();
        if (up) {
            if (up.totalPlay == 5) return res.status(200).send({ 'status': 0, 'message': 'You played 5 times' });
            up.totalPlay += 1;
            up.save((err, result) => {
                if (err) return res.status(200).send({ 'status': 0, 'message': 'Error in gameplay save', data: err });
                return res.status(200).send({ 'status': 1, 'message': 'User score save sucessfully' })
            });
        } else {
            const usp = new userplaylog();
            usp.username = req.userName;
            usp.totalPlay = 1;
            usp.save((err, result) => {
                if (err) return res.status(200).send({ 'status': 0, 'message': 'Error in gameplay save', data: err });
                return res.status(200).send({ 'status': 1, 'message': 'User score save sucessfully' });
            });
        }
    })
})

// 5. /game/claim_bonus - api
app.post('/game/claim_bonus', verifyToken, async (req, res) => {
    if(!req.body.amount) return res.status(200).send({ 'status': 0, 'message': 'Please enter amount' });
    if(req.body.amount <= 100) {
        const userData = await user.findOne({"username" : req.userName });
        userData.points_total -= req.body.amount;
        userData.save((err,result) =>{
            if (err) return res.status(200).send({ 'status': 0, 'message': 'Error in claim bonus', data: err });
            return res.status(200).send({ 'status': 1, 'message': 'claim request accepted'  });
        })
    } else {
        return res.status(200).send({ 'status': 0, 'message': 'Please enter amount less then 100' });
    }
});

// 6. /leaderboard - api
app.get('/leaderboard', async (req, res) => {
    const leaderBoardData = await user.find({}, { "points_total": 1, "username": 1, _id: 0 }).sort({ "points_total": -1 });
    if (!leaderBoardData) return res.status(200).send({ 'status': 0, 'message': 'No data found in leaderboard' });
    const newLeaderBoardData = leaderBoardData.map((element, index) => {
        return {
            points: element.points_total,
            place: index + 1,
            name: element.username
        }
    });
    const topTenPlayer = newLeaderBoardData.slice(0, 10);
    if (req.headers['authorization']) {
        jwt.verify(req.headers['authorization'], config.JWT_SECRETE, (err, decoded) => {
            if (err) return res.status(401).send({ status: 0, message: 'Expire Access Token' });
            const uname = decoded.data.username;
            const findCurrentUserPlace = newLeaderBoardData.find((data) => data['name'] === uname);
            return res.status(200).send({ 'status': 1, 'message': 'Leaderboard data', data: topTenPlayer, 'currentUserPlace': findCurrentUserPlace });
        });
    } else {
        return res.status(200).send({ 'status': 1, 'message': 'Leaderboard data', data: topTenPlayer });
    }
})
 
//mongodb+srv://rovoox:Sumital0612@cluster0.buic5.mongodb.net/?retryWrites=true&w=majority


mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb+srv://rovoox:Sumital0612@cluster0.buic5.mongodb.net/rovoox?retryWrites=true&w=majority', (err, res) => {
    if (err) return err;
    app.listen(3000, () => {
        console.log('Port 3000 running');
    });
})
