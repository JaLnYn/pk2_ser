const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {db} = require('../../dbConfig');
const {mergeUserAndProperty, fav_formate_date} = require('../helpers')


async function fav_append_prop(favs){
    for (i = 0; i < favs.length; i++){
        let resp = await db.query('SELECT * FROM property WHERE prop_id = $1', [favs[i].prop_id]);
        if (resp.rows.length != 1){
            throw new Error('property not found')
        }
        let resp2 = await db.query('SELECT * FROM users WHERE id = $1', [resp.rows[0].landlord]);
        if (resp2.rows.length != 1){
            throw new Error ('property landlord not found')
        }
        favs[i].property = mergeUserAndProperty(resp.rows[0], resp2.rows[0])
        favs[i] = fav_formate_date(favs[i])
    }
    return favs
}

module.exports = {
    
    createProperty: async (args, req) => {
    
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        
        const text = 'INSERT INTO property(prop_address , prop_city , prop_province , prop_country , longitude , latitude , landlord , info , price , bedrooms , utils , parking , furnished , bathroom , sqr_area , preferred_unit) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *'
        const values = [args.prop_address , args.prop_city , args.prop_province , args.prop_country , args.longitude , args.latitude , req.userId, args.info , args.price , args.bedrooms , args.utils , args.parking , args.furnished , args.bathroom , args.sqr_area , args.preferred_unit]
        const usertxt = 'SELECT * FROM users WHERE id = $1'
        const userval = [req.userId]


        try {
            let user_resp = await db.query(usertxt, userval)
            if (user_resp.rows.length != 1){
                throw new Error('user not found or duplicate users');
            }
            let resp = await db.query(text, values)
            if (resp.rows.length > 1){
                throw new Error('Internal db error when adding property to db');
            }
            return {...mergeUserAndProperty(resp.rows[0], user_resp.rows[0])};
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    deleteProperty: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        const text = 'DELETE FROM property WHERE prop_id = $1 AND landlord = $2'
        const values = [args.prop_id , req.userId]

        const delete_fav = 'DELETE FROM favorites WHERE prop_id = $1'
        const del_values = [args.prop_id]

        try{
            let resp = await db.query(text, values)
            if(resp.rowCount < 1){
                return false
            }
            await db.query(delete_fav,del_values)
            
        }catch (err) {
            console.log(err);
            throw err;
        }
        return true;
    },
    decideProperty: async (args, req) => {
        if (!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        

        const check_query = 'SELECT * FROM favorites WHERE user_id = $1 AND prop_id = $2'
        const check_val = [req.userId, args.prop_id]

        const text = 'INSERT INTO favorites(user_id, prop_id, liked, decision_date) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *'
        const values = [req.userId, args.prop_id, args.liked]

        const alter_text = 'UPDATE favorites SET liked = $1 WHERE user_id = $2 AND prop_id = $3'
        const alter_value = [req.liked, args.userId, args.prop_id]
        // const usertxt = 'SELECT * FROM users WHERE id = $1'
        // const userval = [req.userId]

       try {
            // let user_resp = await db.query(usertxt, userval)
            // if (user_resp.rows.length != 1){
            //     throw new Error('user not found or duplicate users');
            // }
            let resp = await db.query("SELECT * FROM property WHERE prop_id = $1", [args.prop_id])
            if (resp.rows.length < 1){
                throw new Error("this property doesn't exist");
            }
            // later make sure you can't favorite ur own
            resp = await db.query(check_query, check_val);

            if (resp.rows.length >= 1) {
                resp = await db.query(alter_text, alter_value);
                return true;
            }

            resp = await db.query(text, values)
            if (resp.rows.length > 1){
                throw new Error('Internal db error when adding property to db');
            }


            return true;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    unmatchProperty: async (args, req) => {
        if (!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        const text = 'UPDATE favorites SET unmatched_date = CURRENT_TIMESTAMP WHERE user_id = $1 AND prop_id = $2'
        const values = [req.userId, args.prop_id]

        try {
            resp = await db.query(text, values)
            if (resp.rows.length < 1){
                throw new Error('did not find favorite');
            }
            //return true;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getFavorites: async (args, req) => {
        if (!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        const getFav = 'SELECT * FROM favorites WHERE user_id = $1 ORDER BY decision_date'
        const valFav = [req.userId]

        try {
            let resp = await db.query(getFav, valFav)            
            return fav_append_prop(resp.rows.slice(args.start_index, args.end_index))
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    


    // getProperty: async (args, req) => {
    //     if (!req.isAuth) {
    //         throw new Error('Unauthenticated!');
    //     }

    //     args.start_index
    //     args.end_index



    //     return 
    // }
};