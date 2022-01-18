const db = require("./db/connection");
const express = require("express")
const app = express();
const { getTopics, getArticleById } = require('./Controllers/app.controller')

app.use(express.json());

app.get('/api/topics', getTopics);

app.get(`/api/articles/:article_id`, getArticleById);

app.all('*', (req, res) => {
    res.status(404).send({ message : 'Invalid Endpoint!'})
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ message : 'Internal Server Error!'})
})

module.exports = app;

