const db = require("./db/connection");
const cors = require('cors');
const express = require("express");
const app = express();
const {
  getTopics,
  getArticleById,
  patchArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  postNewArticle,
  deleteCommentByCommentId,
  getAvailableEndpoints,
  getUsers,
} = require("./Controllers/app.controller");

app.use(cors());

app.use(express.json());

app.get("/api", getAvailableEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/users", getUsers);

app.get(`/api/articles/:article_id`, getArticleById);

app.get(`/api/articles`, getAllArticles);

app.get(`/api/articles/:article_id/comments`, getCommentsByArticleId);

app.patch(`/api/articles/:article_id`, patchArticleById);

app.post(`/api/articles/:article_id/comments`, postCommentByArticleId);

app.post("/api/articles", postNewArticle);

app.delete(`/api/comments/:comment_id`, deleteCommentByCommentId);

app.all("*", (req, res) => {
  res.status(404).send({ message: "Invalid Endpoint!" });
});

app.use((err, req, res, next) => {
  
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else if (
    err.code === "22P02" ||
    err.code === "23502" ||
    err.code === "42703" ||
    err.code === "42601"
  ) {
    res.status(400).send({ message: "Bad Request" });
  } else if (err.code === "23503") {
    res.status(404).send({ message: "No article found" });
  } else {
    res.status(500).send({ message: "Internal Server Error!" });
  }
});

module.exports = app;
