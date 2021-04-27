const multer = require('multer');
const path = require('path');

const url = require('url');
const fs = require('fs')
const {db} = require('../dbConfig');
const shortid = require('shortid');
const global = require('../global')

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,req.generated_prefix + path.extname(file.originalname));
  }
});

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return true
  } else {
    return false
  }
}

const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: async function(req, file, cb){
    // add is auth here
    if (!req.isAuth){
        cb(global.unAuth)
        return;
    }

    if(checkFileType(file, cb) == true){
    }else{
      cb('Error: Images Only!');
    }
    //upload to db
    //const queryObject = url.parse(req.url,true).query;
	try{
      req.body.args = JSON.parse(req.body.args)
  	}catch (err) {
	  console.log(err);
    }

    try{
      // do command 
      // BEFORE -------------------------------------------------------//
      console.log(req.body)
      if (req.body.cmd == 'pp'){// profile pic
        // find and delete old profile pic if it's 0
        let getProfile = null;
        try {
          getProfile = await db.query("SELECT * FROM (users AS A LEFT JOIN img AS B ON A.profile_pic = B.img_id) AS A WHERE id = $1", [req.userId]);

          if (getProfile.rowCount != 1){
            throw new Error("Cannot find user")
          }

                      
          if(getProfile.rows[0].profile_pic != '0'){
            // if it's not 0, delete the profile pic
            deleteThis = await db.query("SELECT * FROM img WHERE img_id = $1", [getProfile.rows[0].profile_pic]);
            try {
              fs.unlinkSync('./public/uploads/' + deleteThis.rows[0].img_loc)
              //file removed
            } catch(err) {
              console.error(err)
            }

            getProfile = await db.query("DELETE FROM img WHERE img_id = $1", [getProfile.rows[0].profile_pic]);
          }
        } catch (err) {
          console.log(err);
          throw new Error("db failed");
        }
      }else if (req.body.cmd == 'prop'){// profile pic
        // find and delete old profile pic if it's 0
        try {
          myPics = await db.query("SELECT * FROM (property_pic NATURAL JOIN property) WHERE prop_id = $1 AND order_num = $2 AND landlord = $3", [req.body.args.prop_id, req.body.args.order_num, req.userId]);
		  console.log(myPics.rows)                     
		  console.log("next will be deleteThis")

          if(myPics.rowCount == 1){
            // if it exists, delete the profile pic
            deleteThis = await db.query("SELECT * FROM img WHERE img_id = $1", [myPics.rows[0].img_id]);
			console.log(deleteThis.rows[0])
            try {
              fs.unlinkSync('./public/uploads/' + deleteThis.rows[0].img_loc)
              //file removed
            } catch(err) {
              console.error(err)
            }
            getProfile = await db.query("DELETE FROM img WHERE img_id = $1", [myPics.rows[0].img_id]);
            getProfile = await db.query("DELETE FROM property_pic WHERE prop_id = $1 AND order_num = $2", [myPics.rows[0].prop_id, myPics.rows[0].order_num]);
          }
        } catch (err) {
          console.log(err);
          throw new Error("db failed");
        }
      } 

      // MIDDLE ---------------------------------------------------------//
      let resp = await db.query('INSERT INTO img(owner_id, sent_to, img_loc) VALUES($1, $2, $3) RETURNING *', [req.userId, req.body.sent_to, req.generated_prefix + path.extname(file.originalname)]) // url input and created uri
      if (resp.rowCount != 1){
        throw new Error("db failed")
      }
      req.img_id = resp.rows[0].img_id


      // AFTER --------------------------------------------------------//
      if (req.body.cmd == 'pp'){
        try {
          console.log(req.userId, req.img_id)
          setProfile = await db.query('UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING *', [req.img_id, req.userId])
          if (setProfile.rowCount != 1){
            throw new Error("Cannot find user")
          }
        } catch (err) {
          console.log(err);
          throw new Error("db failed");
        }
      }else if (req.body.cmd == 'prop'){// property pic
        try {
          setProperty = await db.query('INSERT INTO property_pic(prop_id, order_num, img_id, info) VALUES($1, $2, $3, $4) RETURNING *', [req.body.args.prop_id, req.body.args.order_num, req.img_id, req.body.args.info])
          if (setProperty.rowCount != 1){
            throw new Error("Cannot find insert")
          }
        } catch (err) {
          console.log(err);
          throw new Error("db failed");
        }
      } 

    }catch(err){
      cb("Error: db failed")
      console.log(err);
      throw err;
    }

    cb(null,true);
  }
}).single('file');

const ul = async function (req, res, next) {
  
  req.generated_prefix = shortid.generate() + shortid.generate() + Date.now();
  await upload(req, res, function (err) {
    if (err) {
      //res.send(err);
      console.log("here1", err)
      return res.end(err);
    }
    if (req.file.originalname){
      return res.end(req.generated_prefix + path.extname(req.file.originalname) + " uploaded successfully ID: " + req.img_id);
    }else{
      return res.end("something went wrong");
    }
  });
}

module.exports = ul;
