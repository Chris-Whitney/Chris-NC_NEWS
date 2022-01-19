const db = require("./db/connection");
const express = require("express")
const app = express();
const { getTopics, getArticleById, patchArticleById } = require('./Controllers/app.controller')

app.use(express.json());

app.get('/api/topics', getTopics);

app.get(`/api/articles/:article_id`, getArticleById);

app.patch(`/api/articles/:article_id`, patchArticleById);

app.all('*', (req, res) => {
    res.status(404).send({ message : 'Invalid Endpoint!'})
});

app.use((err, req, res, next) => {
    console.log(err)
    if (err.status && err.message) {
        res.status(err.status).send({message: err.message})
    }
    else if (err.code === '22P02' || err.code === '23502'){
        res.status(400).send({ message : 'Bad Request'})
    } else {
    res.status(500).send({ message : 'Internal Server Error!'})
    }
});




module.exports = app;
