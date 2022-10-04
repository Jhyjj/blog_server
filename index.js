const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs");
const multer = require("multer");

const dbinfo = fs.readFileSync('./database.json');
const conf = JSON.parse(dbinfo);

const connection = mysql.createConnection({
    host:conf.host,
    user:conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
})

app.use(express.json());
app.use(cors());


//서버실행
app.listen(port, ()=>{
    console.log('블로그 서버 돌아가는 중~.~')
})

//이미지 업로드
app.use("/upload", express.static("upload"));

const storage = multer.diskStorage({
    destination:"./upload/",
    filename:function(req,file,cb){
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage:storage,
    limits:{fileSize:1000000}
});

//이미지 등록
app.post("/upload", upload.array('imgs'), function(req, res, next) {
    const imgfile = [];
    req.files.map((img)=> imgfile.push(img.filename))
    res.send({
    img : imgfile
    });
});

//게시글 등록
app.post("/create_post", async (req,res)=>{
    const {title, part, desc, img} = req.body;
    connection.query(
        "insert into posts(`title`,`part`,`desc`,`img`) values(?,?,?,?)",
        [title,part,desc,img],
        (err,rows,fields)=>{
            console.log(err);
        })
} )