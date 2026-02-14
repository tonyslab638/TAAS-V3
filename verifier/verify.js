const express = require("express")
const { ethers } = require("ethers")
require("dotenv").config()

const app = express()

const PORT = process.env.PORT || 10000

// =====================
// CONFIG
// =====================

const RPC_URL = process.env.RPC_URL
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

// =====================
// PROVIDER
// =====================

const provider = new ethers.JsonRpcProvider(RPC_URL)

// =====================
// CONTRACT ABI
// =====================

const ABI = [
"function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)",
"function productExists(string) view returns(bool)"
]

// =====================
// CONTRACT INSTANCE
// =====================

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)

// =====================
// UI PAGE
// =====================

app.get("/", (req,res)=>{
res.send(`
<html>
<head>
<title>ASJUJ Network — Verifier</title>
<style>
body{
background:#0a0a0f;
color:white;
font-family:Segoe UI;
text-align:center;
padding-top:100px;
}
input{
padding:15px;
width:320px;
border-radius:8px;
border:none;
margin-top:20px;
}
button{
padding:15px 30px;
margin-top:20px;
background:#00ffd5;
border:none;
border-radius:8px;
font-weight:bold;
cursor:pointer;
}
.card{
margin:auto;
margin-top:30px;
background:#111;
padding:30px;
border-radius:16px;
width:500px;
box-shadow:0 0 40px rgba(0,255,213,0.15);
}
</style>
</head>

<body>

<h1>ASJUJ Product Verifier</h1>

<form action="/verify" method="POST">
<input name="gpid" placeholder="Enter GPID" required/>
<br>
<button>Verify Product</button>
</form>

</body>
</html>
`)
})

// =====================
// VERIFY LOGIC
// =====================

app.use(express.urlencoded({extended:true}))

app.post("/verify", async (req,res)=>{
try{

const gpid = req.body.gpid

const exists = await contract.productExists(gpid)

if(!exists){
return res.send(`
<h2>❌ Product Not Found</h2>
<p>This GPID is not registered on ASJUJ Network.</p>
<a href="/">Try Again</a>
`)
}

const data = await contract.getProduct(gpid)

res.send(`
<html>
<body style="background:#0a0a0f;color:white;font-family:Segoe UI;text-align:center;padding-top:60px;">

<h1>✅ ASJUJ Verified Product</h1>

<div style="background:#111;padding:30px;border-radius:16px;width:520px;margin:auto">

<p><b>GPID:</b> ${data[0]}</p>
<p><b>Brand:</b> ${data[1]}</p>
<p><b>Model:</b> ${data[2]}</p>
<p><b>Category:</b> ${data[3]}</p>
<p><b>Factory:</b> ${data[4]}</p>
<p><b>Batch:</b> ${data[5]}</p>
<p><b>Born:</b> ${new Date(Number(data[6])*1000).toUTCString()}</p>
<p><b>Issuer:</b> ${data[7]}</p>
<p><b>Owner:</b> ${data[8]}</p>

</div>

<br>
<a href="/" style="color:#00ffd5">Verify Another</a>

</body>
</html>
`)

}catch(err){
res.send("<h2>❌ Error</h2><pre>"+err+"</pre>")
}
})

// =====================
// START SERVER
// =====================

app.listen(PORT,()=>{
console.log("TAAS Verifier V3 running on",PORT)
})