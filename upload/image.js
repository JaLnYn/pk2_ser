
const path = require('path');
const url = require('url');

const {db} = require('../dbConfig');

module.exports = async (req, res) => {
    if (!req.isAuth){
        res.end('Unauthenticated!')
        return
    }

    // get from database first

    const queryObject = url.parse(req.url,true).query;
    try{
        let resp = await db.query('SELECT * FROM img WHERE img_loc = $1', [queryObject.img_loc]);
        if(resp.rowCount != 1){
            res.end("incorrect amount of images found please reupload")
            return
        }
        if (req.userId == resp.rows[0].sent_to || resp.rows[0].sent_to == 0 || resp.rows[0].owner_id == req.userId){
            // you are authenticated 
            res.sendFile(path.join(__dirname, "../public/uploads/" + queryObject.img_loc))
            return
        }else {
            res.status(400).end("Unauthenticated!")
            return
        }
    }catch(err){
        console.log(err);
        res.end(err)
        return
    }
    
    
}