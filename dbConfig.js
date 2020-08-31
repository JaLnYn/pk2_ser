require('dotenv').config();

const {Pool} = require('pg')

const conString = 'postgresql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME 
const db = new Pool({
    connectionString: conString
})

module.exports = {db}