const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {db} = require('../../dbConfig');
const {dbToGQL_User} = require('../helpers')

module.exports = {
    checkAccount: async(args) => {
        try {
            let resp = await db.query('SELECT * FROM users WHERE email = $1', [args.email])
            if (resp.rows.length >= 1){
                throw new Error('User exists already.')
            }
            // we can check password here
        }catch(err){
            throw err;
        }
        return true;
    },
    signup: async (args) => {
        try {

            let query = 'SELECT * FROM users WHERE email = $1';
            let res = await db.query(query, [args.email])
            if (res.rows.length >= 1){
                throw new Error('User exists already.');
            }
            const hashedPassword = await bcrypt.hash(args.password, 12);
            const text = 'INSERT INTO users(email, password, f_name, l_name, gender, user_type, date_of_birth) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *'
            
            const values = [args.email, hashedPassword, args.f_name, args.l_name, args.gender, args.user_type, args.date_of_birth]

            res = await db.query(text, values)
            if (res.rows.length > 1){
                throw new Error('Internal db error when adding user to db');
            }

            
            return {...dbToGQL_User(res.rows[0])}
            
        } catch (err) {
            throw err;
        }
    },
    login: async (args) => {
        let query = 'SELECT * FROM users WHERE email = $1';
        let res = await db.query(query, [args.email])

        if (res.rows.length > 1){
            throw new Error('Internal db error when adding user to db');
        }
        const user = res.rows[0];
        if (!user) {
            throw new Error('User does not exist!');
        }
        const isEqual = await bcrypt.compare(args.password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect!');
        }
        const token = jwt.sign(
        { userId: user.id, email: user.email },
        'somesupersecretkey',
        {
            expiresIn: '1h'
        }
        );
        return { userId: user.id, token: token, tokenExpiration: 1 };
        
    }
};