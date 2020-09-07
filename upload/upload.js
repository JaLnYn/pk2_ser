const multer = require('multer');
const path = require('path');

const url = require('url');
const {db} = require('../dbConfig');
const shortid = require('shortid');

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
        cb('Unauthenticated!')
        return;
    }

    if(checkFileType(file, cb) == true){
    }else{
      cb('Error: Images Only!');
    }
    //upload to db
    const queryObject = url.parse(req.url,true).query;
    try{
      let resp = await db.query('INSERT INTO img(owner_id, sent_to, img_loc) VALUES($1, $2, $3) RETURNING *', [req.userId, queryObject.sent_to, req.generated_prefix + path.extname(file.originalname)]) // url input and created uri
      if (resp.rowCount != 1){
        throw new Error("db failed")
      }
      req.img_id = resp.rows[0].img_id
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
      return res.end(err);
    }
    return res.end(req.generated_prefix + path.extname(req.file.originalname) + " uploaded successfully ID: " + req.img_id);
  });
}

module.exports = ul;