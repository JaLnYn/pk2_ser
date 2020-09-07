const jwt = require('jsonwebtoken');
const isAuth = require('./is-auth');

module.exports = (req, res, next) => {
  
  console.log(req);
  if (!req.isAuth){
    res.status(401).end()
  }

  if (req.url == "/upload"){

  }else if (req.url == "/image"){

  }
  
  
};