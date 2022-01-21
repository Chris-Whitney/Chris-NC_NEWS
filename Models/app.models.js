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

exports.fetchAllArticles = (sort_by = 'created_at', order_by = 'DESC', topic) => {
        let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
        LEFT JOIN comments 
        ON articles.article_id = comments.article_id`
    
        if(topic) {
            queryStr += ` WHERE topic = $1 GROUP BY articles.article_id`
            return db.query(queryStr, [ topic ])
            .then((result) => {
                console.log(result.rows)
                if(result.rows.length === 0) {
                    return Promise.reject(
                    {
                        status: 404,
                        message: 'Topic Not Found!'
                    }
                  )
                }
                return result.rows
            })
    }
    
       else { 
        return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
        LEFT JOIN comments 
        ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order_by}`)
        .then((result) => {
            return result.rows
        })
    }
        
    };

    exports.fetchCommentsByArticleId = (article_id) => {
      const ArticleQuant = [];

      return db
        .query(`SELECT articles.article_id FROM articles`)
        .then((result) => {
          ArticleQuant.push(result.rows.length);
        })
        .then(() => {
          return db.query(
            `SELECT comments.comment_id, comments.votes, comments.created_at, users.username AS author, comments.body FROM comments INNER JOIN articles ON comments.article_id = articles.article_id INNER JOIN users ON comments.author = users.username
    WHERE articles.article_id = $1`,
            [article_id]
          );
        })

        .then((result) => {
          if (parseInt(article_id) <= ArticleQuant[0]) {
            return Promise.resolve(result.rows);
          }

          if (parseInt(article_id) > ArticleQuant[0]) {
            return Promise.reject({
              status: 404,
              message: `No article found for article_id ${article_id}`,
            });
          }

          return result.rows;
        });
    };

exports.postNewComment = (username, body, article_id) => {
 return db.query(`INSERT INTO comments
 (votes, author, body, article_id)
 VALUES (0, $1, $2, $3)
 RETURNING comment_id, votes, created_at, author, body
 `, [username, body, article_id])
 .then((result) => {
    return result.rows[0]
 })
}
//article_id, title, body, votes, topic, author, created_at

///api/resource/:id body: {} -> malformed body / missing required fields: 400 Bad Request
// /api/resource/:id body: { increase_votes_by: "word" } -> incorrect type: 400 Bad Request
