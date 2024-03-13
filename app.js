const express = require('express');
const cors = require('cors');
const { setupSocket } = require('./socket');
const app = express();
app.use(cors())

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

var numberOfRewards;
var numberOfChallenges;
var challengeDuration;
var running = false;
var timer;
var originalDuration;

app.use(
    express.json({
        limit: "50mb",
        extended: true
    })
);
app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
    })
);

const getNextAnnouncement = () => {
    return challengeDuration;
}

app.get("/api/hello-world", (req, res) => {
    return res.status(200).send('Hello world from API !!!!');
});

app.get('/api/get', (req, res) => {
    res.status(200).send({
        numberOfRewards: numberOfRewards || 0,
        numberOfChallenges: numberOfChallenges || 0,
        challengeDuration: originalDuration / 60 || 0,
        running
    });
})

app.post('/api/set', (req, res) => {
    const {
        nRewards,
        nChallenges,
        cDuration
    } = req.body;
    if (!nRewards || !nChallenges || !cDuration) return res.status(400).send('Missing Parameter');
    numberOfRewards = nRewards;
    numberOfChallenges = nChallenges;
    challengeDuration = cDuration * 60;
    originalDuration = cDuration * 60;
    running = false;
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    return res.status(200).send();
});

app.post('/api/start', (req, res) => {
    if (running) return res.status(400);
    // random 1 direction
    randomDirection(); // OP -> BASE, BASE -> OP
    running = true;
    timer = setInterval(() => {
        challengeDuration--;
        io.emit('duration-countdown', challengeDuration);
        if (challengeDuration <= 0) {
            randomDirection();
            challengeDuration = originalDuration; // reset
        }
    }, 1000);
    res.status(200).send();
})

const randomDirection = () => {

}

setupSocket(io, getNextAnnouncement);

server.listen('4001', () => {
    console.log('Server in listening port 4001');
});