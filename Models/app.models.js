const db = require('../db/connection')

exports.fetchTopics = () => {
    return db.query(`SELECT * FROM topics`)
    .then((topics) => {
        return topics.rows
    })
};

exports.fetchArticleById = (id) => {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.votes, articles.created_at,
    COUNT(comments.comment_id)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`, [ id ])
    .then((result) => {
        return result.rows[0]
    })
    // return db.query(`SELECT * FROM articles WHERE article_id=$1`, [ id ])
    // .then((article) => {
    //  console.log(article.rows[0]);
    // })
};

//