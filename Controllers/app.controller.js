const { fetchTopics, fetchArticleById, updateArticleById, fetchAllArticles} = require('../Models/app.models');

exports.getTopics = (req, res, next) => {
    fetchTopics()
    .then((topics) => {
        res.status(200).send({ topics })
    })
    .catch(next);
    
};

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    fetchArticleById(article_id).then((article) => {
       res.status(200).send({ article })
    })
    .catch(next)
};

exports.patchArticleById = (req, res,  next) => {
    const { article_id } = req.params
    const { inc_votes } = req.body
    console.log(inc_votes)
    updateArticleById(article_id, inc_votes)
    .then((updatedArticle) => {
        res.status(201).send({ updatedArticle });    
    })
    .catch(next);
    
};

exports.getAllArticles = (req, res, next) => {
    const { order_by } = req.query;
    const { sort_by } = req.query;
    const { topic } = req.query
    fetchAllArticles(sort_by, order_by, topic)
    .then((articles) => {
        res.status(200).send({ articles })
    })
    .catch(next);
}