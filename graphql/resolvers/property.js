const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {db} = require('../../dbConfig');
const {mergeUserAndProperty, fav_formate_date} = require('../helpers')
const global = require('../../global')

async function prop_append_room(property){
    try {
        let resp = await db.query('SELECT * FROM room WHERE parent_prop_id = $1',[property.prop_id]);

        
    } catch(err) {
        throw err
    }
}

async function handleProp(prop){
    
    let resp2 = await db.query('SELECT * FROM users WHERE id = $1', [prop.landlord]);
    if (resp2.rows.length != 1){
        throw new Error ('property landlord not found')
    }
    
    prop = mergeUserAndProperty(prop, resp2.rows[0])
    let resp3 = await db.query('SELECT * FROM room WHERE parent_prop_id = $1', [prop.prop_id]);
    let resp4 = await db.query('SELECT * FROM property_pic INNER JOIN img ON property_pic.img_id = img.img_id WHERE prop_id = $1', [prop.prop_id]);
    
    prop.Images = resp4.rows 

    prop.rooms = resp3.rows
    for (j = 0; j < resp3.rows.length; j++){
        let resp5 = await db.query('SELECT * FROM room_pic INNER JOIN img ON room_pic.img_id = img.img_id WHERE room_id = $1', [resp3.rows[j].room_id])
        prop.rooms[j].Images = resp5.rows   
    }
    return prop
}

async function fav_append_prop(favs){
    try{
        for (i = 0; i < favs.length; i++){
            let resp = await db.query('SELECT * FROM property WHERE prop_id = $1', [favs[i].prop_id]);
            if (resp.rows.length != 1){
                throw new Error('property not found')
            }
            favs[i].property = await handleProp(resp.rows[0])
            favs[i] = fav_formate_date(favs[i])
        }
    }catch (err){
        throw err
    }
    
    return favs
}

module.exports = {
    createProperty: async (args, req) => {
    
        if (!req.isAuth) {
            throw new Error(global.unAuth);
        }
        
        const text = 'INSERT INTO property(apt_num, prop_address , prop_city , prop_province , prop_country , longitude , latitude , landlord , info , price , bedrooms , utils , parking , furnished , bathroom , sqr_area , avail_on) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *'
        const values = [args.apt_num, args.prop_address , args.prop_city , args.prop_province , args.prop_country , args.longitude.toFixed(5) , args.latitude.toFixed(5) , req.userId, "" , args.price , args.bedrooms , args.utils , args.parking , args.furnished , args.bathroom , args.sqr_area.toFixed(2) , args.avail_on]
        const usertxt = 'SELECT * FROM users WHERE id = $1'
        const userval = [req.userId]
        console.log(values)
        try {
            let user_resp = await db.query(usertxt, userval)
            if (user_resp.rows.length != 1){
                throw new Error('user not found or duplicate users');
            }
            let resp = await db.query(text, values)
            if (resp.rows.length > 1){
                throw new Error('Internal db error when adding property to db');
            }

            console.log(resp)
            return {...mergeUserAndProperty(resp.rows[0], user_resp.rows[0])};
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
	updateProperty: async (args, req) => {
    
        if (!req.isAuth) {
            throw new Error(global.unAuth);
        }
        
        const text = 'UPDATE property SET info = $1, price = $2, bedrooms = $3, utils = $4, parking = $5, furnished = $6, bathroom = $7, avail_on = $8 WHERE prop_id = $9 AND landlord = $10'
        const values = [ args.info , args.price , args.bedrooms , args.utils , args.parking , args.furnished , args.bathroom ,args.avail_on, args.prop_id, req.userId]
        const usertxt = 'SELECT * FROM users WHERE id = $1'
        const userval = [req.userId]
		
        try {
            let user_resp = await db.query(usertxt, userval)
            if (user_resp.rows.length != 1){
                throw new Error('user not found or duplicate users');
            }
            let resp = await db.query(text, values)
            let resp4 = await db.query('SELECT * FROM property WHERE prop_id = $1 AND landlord = $2', [args.prop_id, req.userId])
			if (resp4.rows.length > 1){
                throw new Error('getting prop from ');
            }
            return {...mergeUserAndProperty(resp4.rows[0], user_resp.rows[0])};
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    deleteProperty: async (args, req) => {
        if (!req.isAuth) {
            throw new Error(global.unAuth);
        }
        const text = 'DELETE FROM property WHERE prop_id = $1 AND landlord = $2'
        const values = [args.prop_id , req.userId]

        const delete_fav = 'DELETE FROM favorites WHERE prop_id = $1'
        const del_values = [args.prop_id]

		console.log("delete start")
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
		console.log("delete suc")
        return true;

    },
    decideProperty: async (args, req) => {
        if (!req.isAuth){
            throw new Error(global.unAuth);
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
            throw new Error(global.unAuth);
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
            throw new Error(global.unAuth);
        }
        const getFav = 'SELECT * FROM favorites WHERE user_id = $1 ORDER BY decision_date'
        const valFav = [req.userId]
        try {
            let resp = await db.query(getFav, valFav);
            return fav_append_prop(resp.rows.slice(args.start_index, args.end_index))
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getMyProperty: async (args, req) => {
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }
        const getFav = 'SELECT * FROM property WHERE landlord = $1 ORDER BY prop_id'
        const valFav = [req.userId]
        try {
            let resp = await db.query(getFav, valFav);
            resp.rows = resp.rows.slice(args.start_index, args.end_index)
            for (i = 0; i < resp.rows.length; i++){
                resp.rows[i] = await handleProp(resp.rows[i]);
            }
            return resp.rows
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    createRoom: async (args, req) => {
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        try {
            let resp2 = await db.query('SELECT * FROM property WHERE prop_id = $1', [args.parent_prop_id]);
            if (resp2.rowCount < 1){
                throw new Error("this property does not exist")
            }
            if (resp2.rows[0].landlord != req.isAuth){
                throw new Error("this property does not belong to you.")
            }
            let resp = await db.query("INSERT INTO room(parent_prop_id, sqr_area) VALUES($1, $2) RETURNING *", [args.parent_prop_id, args.sqr_area])
            if (resp.rowCount != 1){
                throw new Error("failed")
            }else{
                return resp.rows[0];
            } 

        }catch (err){
            console.log(err);
            throw err;
        }

    },
    deleteRoom: async (args, req) => {
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }
        try {
            let resp = await db.query("DELETE FROM room WHERE room_id = $1", [args.room_id])
            if (resp.rowCount != 1){
                throw new Error("failed")
            }else{
                return true;
            } 

        }catch (err){
            console.log(err);
            throw err;
        }
    },  
    addImageToRoom: async (args, req)=>{
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        try {
            let resp2 = await db.query('SELECT * FROM room WHERE room_id = $1', [args.room_id]);
            if (resp2.rowCount < 1){
                throw new Error("this room does not exist")
            }
            let resp3 = await db.query('SELECT * FROM property WHERE prop_id = $1', [resp2.rows[0].parent_prop_id]);
            if (resp3.rowCount < 1){
                throw new Error("this room does not exist")
            }
            if (resp3.rows[0].landlord != req.isAuth){
                throw new Error("this property does not belong to you.")
            }
            let resp10 = await db.query('SELECT * FROM img WHERE img_id = $1', [args.img_id])
            if (resp10.rowCount < 1 || resp10.rows[0].owner_id != req.userId){
                throw new Error("you can't use this image")
            }
            let resp = await db.query("INSERT INTO room_pic(room_id, img_id) VALUES($1, $2) RETURNING *", [args.room_id, args.img_id])
            if (resp.rowCount != 1){
                throw false;
            }else{
                return true;
            } 

        }catch (err){
            console.log(err);
            throw err;
        }
    },
    addImageToProp: async (args, req)=>{
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        try {
            let resp2 = await db.query('SELECT * FROM property WHERE prop_id = $1', [args.prop_id]);
            if (resp2.rowCount < 1){
                throw new Error("this room does not exist")
            }
            if (resp2.rows[0].landlord != req.isAuth){
                throw new Error("this property does not belong to you.")
            }
            let resp10 = await db.query('SELECT * FROM img WHERE img_id = $1', [args.img_id])
            if (resp10.rowCount < 1 || resp10.rows[0].owner_id != req.userId){
                throw new Error("you can't use this image")
            }
            let resp = await db.query("INSERT INTO property_pic(prop_id, img_id) VALUES($1, $2) RETURNING *", [args.prop_id, args.img_id])
            if (resp.rowCount != 1){
                throw new Error("failed");
            }else{

            } 
            return true

        }catch (err){
            console.log(err);
            throw err;
        }
    },
    rmImageToRoom:async (args, req)=>{
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        try {
            let resp2 = await db.query('SELECT * FROM room WHERE room_id = $1', [args.room_id]);
            if (resp2.rowCount < 1){
                throw new Error("this room does not exist")
            }
            let resp3 = await db.query('SELECT * FROM property WHERE prop_id = $1', [resp2.rows[0].parent_prop_id]);
            if (resp3.rowCount < 1){
                throw new Error("this room does not exist")
            }
            if (resp3.rows[0].landlord != req.isAuth){
                throw new Error("this property does not belong to you.")
            }
            let resp = await db.query("DELETE FROM room_pic WHERE room_id = $1 AND img_id = $2", [args.room_id, args.img_id])
            if (resp.rowCount != 1){
                return false;
            }else{
                return true;
            } 

        }catch (err){
            console.log(err);
            throw err;
        }
    },
    rmImageToProp:async (args, req)=>{
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        try {
            let resp2 = await db.query('SELECT * FROM property WHERE prop_id = $1', [args.prop_id]);
            if (resp2.rowCount < 1){
                throw new Error("this room does not exist")
            }
            if (resp2.rows[0].landlord != req.isAuth){
                throw new Error("this property does not belong to you.")
            }
            let resp = await db.query("DELETE FROM property_pic WHERE prop_id=$1 AND img_id=$2", [args.prop_id, args.img_id])
            if (resp.rowCount != 1){
                return false;
            }else{
                return true;
            } 

        }catch (err){
            console.log(err);
            throw err;
        }
    },
    getMyImages: async (args, req) => {
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        try {
            let resp = await db.query('SELECT * FROM img WHERE owner_id = $1', [req.userId])
            return resp.rows
        }catch (err){
            console.log(err);
            throw err;
        }
    },
    getOneProperty: async (args,req)=> {
        if (!req.isAuth){
            throw new Error(global.unAuth);
        }
        const get = 'SELECT * FROM property WHERE prop_id = $1 ORDER BY prop_id'
        const val = [ args.id]

        try {
            let resp = await db.query(get, val);
			if (resp.rowCount < 1){
				throw new Error("this room does not exist")
			}
			if (resp.rowCount > 1){
				throw new Error("multi-error")
			}
            const handled = await handleProp(resp.rows[0])
			return handled
        } catch (err) {
            console.log(err);
            throw err;
        }
	},
	setPropertyPicInfo: async (args, req) => {
		if (!req.isAuth){
            throw new Error(global.unAuth);
        }

        const get = 'UPDATE property_pic SET info = $1 WHERE prop_id = $2 AND order_num = $3'
        const val = [ args.info, args.prop_id, args.order_num]

        try {
            let auth = await db.query('SELECT * FROM property WHERE prop_id = $1 AND landlord = $2', [args.prop_id, req.userId]);
			if (auth.rowCount != 1){
				throw new Error("you do not have authorization")
			}

            let exits = await db.query('SELECT * FROM property_pic WHERE prop_id = $1 AND order_num = $2', [args.prop_id, args.order_num]);
			if (auth.rowCount != 1){
				throw new Error("pic does not exist")
			}

            let resp = await db.query(get, val);
			if (resp.rowCount < 1){
				throw new Error("this room does not exist")
			}
			if (resp.rowCount > 1){
				throw new Error("multi-error")
			}
			return true
        } catch (err) {
            console.log(err);
            throw err;
        }
	}
	
    

    // getProperty: async (args, req) => {
    //     if (!req.isAuth) {
    //         throw new Error('Unauthenticated!');
    //     }

    //     args.start_index
    //     args.end_index



    //     return 
    // }
};
