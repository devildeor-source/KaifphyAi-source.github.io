const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let searchLogs = [];

/* FILE UPLOAD SYSTEM */

const storage = multer.diskStorage({
 destination: function(req,file,cb){
  cb(null,"uploads/");
 },
 filename: function(req,file,cb){
  cb(null,Date.now()+"-"+file.originalname);
 }
});

const upload = multer({storage});

/* ADMIN FILE UPLOAD */

app.post("/upload", upload.single("file"), (req,res)=>{
 res.json({message:"File uploaded"});
});

/* READ FILE FUNCTION */

async function readFile(path){

 if(path.endsWith(".pdf")){
  const data = await pdf(fs.readFileSync(path));
  return data.text;
 }

 return fs.readFileSync(path,"utf8");
}

/* CHAT SYSTEM */

app.post("/chat", async(req,res)=>{

 const userMessage = req.body.message;

 searchLogs.push(userMessage);

 const files = fs.readdirSync("./uploads");

 let knowledge = "";

 for(let file of files){

  const text = await readFile("./uploads/"+file);

  knowledge += text.toLowerCase();
 }

 let reply = "No information found";

 if(knowledge.includes(userMessage.toLowerCase())){
  reply = "Information related to your question exists in knowledge base.";
 }

 res.json({reply});

});

/* VIEW USER SEARCHES */

app.get("/searches",(req,res)=>{
 res.json(searchLogs);
});

/* START SERVER */

app.listen(3000,()=>{
 console.log("Server running on port 3000");
});
