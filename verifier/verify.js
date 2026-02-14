import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  [
    "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
  ],
  provider
);


// ================= DESIGN TEMPLATE =================
function page(content){
return `
<html>
<head>
<title>ASJUJ Verification</title>

<style>

body{
margin:0;
font-family: 'Segoe UI', sans-serif;
background: linear-gradient(135deg,#050505,#111,#050505);
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}

.card{
background: rgba(255,255,255,0.04);
border:1px solid rgba(255,255,255,0.15);
backdrop-filter: blur(25px);
padding:50px;
border-radius:25px;
width:420px;
text-align:center;
box-shadow:0 0 60px rgba(0,255,255,0.08);
animation:fade 1s ease;
}

@keyframes fade{
from{opacity:0; transform:translateY(30px)}
to{opacity:1; transform:translateY(0)}
}

.title{
font-size:28px;
font-weight:700;
margin-bottom:30px;
letter-spacing:1px;
}

input{
width:100%;
padding:14px;
border-radius:10px;
border:none;
outline:none;
font-size:16px;
margin-bottom:20px;
}

button{
width:100%;
padding:14px;
border:none;
border-radius:12px;
background:linear-gradient(45deg,#00f0ff,#00ffa6);
font-weight:700;
font-size:16px;
cursor:pointer;
transition:.3s;
}

button:hover{
transform:scale(1.05);
box-shadow:0 0 20px cyan;
}

.label{
color:#9ae6ff;
margin-top:10px;
font-size:14px;
}

.value{
margin-bottom:10px;
font-weight:600;
word-break:break-word;
}

.success{
color:#00ffa6;
font-size:22px;
margin-bottom:20px;
}

.error{
color:#ff5e7a;
font-size:22px;
margin-bottom:20px;
}

a{
color:#00f0ff;
text-decoration:none;
font-weight:600;
}

</style>
</head>
<body>
${content}
</body>
</html>
`;
}



// ================= HOME =================
app.get("/", (req,res)=>{
res.send(page(`
<div class="card">
<div class="title">ASJUJ PRODUCT VERIFY</div>

<form action="/verify">
<input name="gpid" placeholder="Enter GPID"/>
<button>Verify Authenticity</button>
</form>

</div>
`));
});




// ================= VERIFY =================
app.get("/verify", async(req,res)=>{

try{

const gpid=req.query.gpid;
const p=await contract.getProduct(gpid);

res.send(page(`
<div class="card">

<div class="success">✔ AUTHENTIC PRODUCT</div>

<div class="label">GPID</div>
<div class="value">${p[0]}</div>

<div class="label">Brand</div>
<div class="value">${p[1]}</div>

<div class="label">Model</div>
<div class="value">${p[2]}</div>

<div class="label">Category</div>
<div class="value">${p[3]}</div>

<div class="label">Factory</div>
<div class="value">${p[4]}</div>

<div class="label">Batch</div>
<div class="value">${p[5]}</div>

<div class="label">Born</div>
<div class="value">${new Date(Number(p[6])*1000).toUTCString()}</div>

<div class="label">Issuer</div>
<div class="value">${p[7]}</div>

<div class="label">Owner</div>
<div class="value">${p[8]}</div>

<br>
<a href="/">Verify Another</a>

</div>
`));

}catch{

res.send(page(`
<div class="card">

<div class="error">❌ PRODUCT NOT FOUND</div>

<div style="opacity:.7">
This GPID is not registered on ASJUJ Network
</div>

<br><br>
<a href="/">Try Again</a>

</div>
`));

}

});


app.listen(PORT,()=>console.log("Verifier running on",PORT));