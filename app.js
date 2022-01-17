const db = require("./db/connection");
const express = require("express")
const app = express();
const { getTopics } = require('./Controllers/app.controller')

app.use(express.json());

app.get('/api/topics', getTopics);


module.exports = app;

