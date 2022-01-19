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
        const article = result.rows[0];
        if(!article) {
            return Promise.reject({
                status: 404,
                message: `No article found for article_id ${id}`
            });
        }
        return article;
    })
};

exports.updateArticleById = (id, votes) => {
    return db.query(`UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2 RETURNING*;`, [ votes , id ])
    .then((result) => {
        return result.rows[0];
    })
};

exports.fetchAllArticles = (sort_by = 'created_at') => {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.votes, articles.created_at,
    COUNT(comments.comment_id)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by}`).then((articles) => {
        return articles.rows
    })
}

//article_id, title, body, votes, topic, author, created_at

///api/resource/:id body: {} -> malformed body / missing required fields: 400 Bad Request
// /api/resource/:id body: { increase_votes_by: "word" } -> incorrect type: 400 Bad Request
