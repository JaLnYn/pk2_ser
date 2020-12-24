const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {db} = require('../../dbConfig');
const {dbToGQL_User} = require('../helpers')
const global = require('../../global')

module.exports = {
    getUser: async (args, req) => {
        if(!req.isAuth){
            throw new Error(global.unAuth);
        }
        try {
            let resp = await db.query("SELECT * FROM (users AS A LEFT JOIN img AS B ON A.profile_pic = B.img_id) AS A WHERE id = $1", [args.id]);
            if (resp.rowCount != 1){
                throw new Error("Cannot find user")
            }
            return {...dbToGQL_User(resp.rows[0])}
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    updateUser: async (args, req) => {
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        let cmd = ""
        let input = []
        
        if (args.bio && args.user_type){
            if(args.user_type != 'T' && args.user_type != 'L'){
                throw new Error("Must be tenent or landlord");
            }
            if(args.bio.length >= 20){
                throw new Error("to many chars")
            }
            cmd = "UPDATE users SET bio = $1, user_type = $2 WHERE id = $3 RETURNING *"
            input = [args.bio, args.user_type, req.userId]
        }else{
            if (args.bio){
                if(args.bio.length >= 20){
                    throw new Error("to many chars")
                }
                cmd = "UPDATE users SET bio = $1 WHERE id = $2 RETURNING *"
                input = [args.bio, req.userId]
            }
            if (args.user_type){
                if(args.user_type != 'T' && args.user_type != 'L'){
                    throw new Error("Must be tenent or landlord");
                }
                cmd = "UPDATE users SET user_type = $1 WHERE id = $2 RETURNING *"
                input = [args.user_type, req.userId]
            }
        }
        if(cmd != ""){
            try {
                let resp = await db.query(cmd, input)
                return resp.rows[0]
            }catch(err){
                throw err;
            }
        }
    },
    checkAuth: async (args, req) => {
        if(!req.isAuth){
            return false;
        }
        return true;
    },
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
            const text = 'INSERT INTO users(email, password, f_name, l_name, gender, user_type, date_of_birth, profile_pic) VALUES($1, $2, $3, $4, $5, $6, $7, 0) RETURNING *'
            if(args.user_type != 'T' && args.user_type != 'L'){
                throw new Error("must select tenent or landlord")
            }
 
            if(args.gender != 'M' && args.gender != 'O' && args.gender != 'F'){
                throw new Error("must select a gender")
            }


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
        return { userId: user.id, token: token, tokenExpiration: 1, user_type: user.user_type};
        
    }
};