import express from "express";
import { ethers } from "ethers";
import QRCode from "qrcode";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 10000;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
process.env.CONTRACT_ADDRESS,
[
"function createProduct(string,string,string,string,string,string)"
],
wallet
);


// PAGE TEMPLATE
function page(content){
return `
<html>
<head>
<title>ASJUJ Panel</title>
<style>

body{
margin:0;
font-family:Segoe UI;
background:black;
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}

.card{
background:#0b0b0b;
padding:50px;
border-radius:20px;
width:430px;
text-align:center;
box-shadow:0 0 60px rgba(0,255,255,.2);
}

.title{
font-size:28px;
margin-bottom:25px;
}

input{
width:100%;
padding:14px;
margin-bottom:12px;
border-radius:10px;
border:none;
background:#111;
color:white;
}

button{
width:100%;
padding:14px;
border:none;
border-radius:12px;
background:linear-gradient(45deg,#00f0ff,#00ffa6);
font-weight:bold;
cursor:pointer;
}

button:hover{transform:scale(1.05)}

.success{color:#00ffa6;font-size:22px;margin-bottom:15px;}

.qr{
margin-top:20px;
}

a{color:#00eaff;text-decoration:none;}

</style>
</head>
<body>
${content}
</body>
</html>
`;
}



// HOME
app.get("/",(req,res)=>{
res.send(page(`
<div class="card">

<div class="title">ASJUJ PRODUCT PANEL</div>

<form action="/create">

<input name="gpid" placeholder="GPID" required>
<input name="brand" placeholder="Brand" required>
<input name="model" placeholder="Model" required>
<input name="category" placeholder="Category" required>
<input name="factory" placeholder="Factory" required>
<input name="batch" placeholder="Batch" required>

<button>Create Product</button>

</form>

</div>
`));
});




// CREATE PRODUCT
app.get("/create", async(req,res)=>{

try{

const {gpid,brand,model,category,factory,batch}=req.query;

const tx = await contract.createProduct(
gpid,
brand,
model,
category,
factory,
batch
);

await tx.wait();

const verifyURL = `${process.env.VERIFIER_URL}/verify?gpid=${gpid}`;
const qr = await QRCode.toDataURL(verifyURL);

res.send(page(`
<div class="card">

<div class="success">✔ Product Created</div>

GPID:<br>${gpid}<br><br>
TX:<br>${tx.hash}

<div class="qr">
<img src="${qr}" width="200">
</div>

<br>
<a href="${verifyURL}">Verify Page</a>

<br><br>
<a href="/">Create Another</a>

</div>
`));

}catch(e){

res.send(page(`
<div class="card">

<div style="color:#ff5e7a;font-size:22px;">❌ Error</div>
<br>
${e.reason || e.message}

<br><br>
<a href="/">Back</a>

</div>
`));

}

});


app.listen(PORT,()=>console.log("Panel running on",PORT));