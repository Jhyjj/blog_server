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
            res.send(rows);
        })
} )


//포스트 목록 불러오기 -> 최신글부터로 변경
app.get("/posts/:list",async (req,res)=>{
    const {list} = req.params;
    console.log(list);
    connection.query(list==="전체보기"? `select * from posts order by no desc` : `select * from posts where part ='${list}' order by no desc `,
    (err,rows,fields)=>{
        console.log(rows);
        res.send(rows);
    })
})

//특정포스트 하나만 불러오기
app.get("/post/:no", async (req,res)=>{
    const {no} = req.params;
    connection.query(`select * from posts where no = '${no}'`,
    (err,rows,fields)=>{
        console.log(rows);
        res.send(rows[0]);
    })
})

//최근포스트 4개만 불러오기
app.get("/postLatest",async (req,res)=>{
    connection.query("select * from posts order by no desc limit 4",
    (err,rows,fields)=>{
        console.log(rows);
        res.send(rows);
    })
})

//포스트 삭제 쿼리
app.post("/delete/:no", async (req,res)=>{
    const {no} = req.params;
    connection.query(`delete from posts where no = '${no}'`,
    (err,rows,fields)=>{
        console.log(err);
        res.send("포스트 삭제 완료")
    })
})


//포스트 수정하기
app.post("/update_post/:no", async (req,res)=>{
    const {no} = req.params;
    const {title,part,desc,img} = req.body;
    connection.query('update posts set `title`=?, `part`=?, `desc`=? where `no` =?',
    [title,part,desc,no],
    (err,rows,fields)=>{
        console.log(err);
        res.send("포스트 수정 완료")
    })
})