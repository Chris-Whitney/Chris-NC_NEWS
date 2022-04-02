const {
  fetchTopics,
  fetchArticleById,
  updateArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  postNewComment,
  postArticle,
  deleteComment,
  fetchUsers,
} = require("../Models/app.models");
const endpoints = require("../endpoints.json");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleById(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  const { order_by } = req.query;
  const { sort_by } = req.query;
  const { topic } = req.query;
  fetchAllArticles(sort_by, order_by, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postNewArticle = (req, res, next) => {
  const { title, topic, username, body } = req.body;
  postArticle(username, title, body, topic)
    .then((postedArticle) => {
      console.log(postedArticle);
      res.status(201).send({ postedArticle });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username } = req.body;
  const { body } = req.body;
  postNewComment(username, body, article_id)
    .then((postedComment) => {
      res.status(201).send({ postedComment });
    })
    .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
  const { article_id, comment_id } = req.params;
  deleteComment(article_id, comment_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch(next);
};

exports.getAvailableEndpoints = (req, res, next) => {
  res.status(200).send(endpoints);
};

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};
