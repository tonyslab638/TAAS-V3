import express from "express"
import bodyParser from "body-parser"
import { ethers } from "ethers"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(bodyParser.urlencoded({ extended:true }))
app.use(bodyParser.json())

/* ========================
   BLOCKCHAIN CONNECTION
======================== */

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

/* ========================
   CORE CONTRACT
======================== */

const CORE_ABI = [
"function createProduct(string,string,string,string,string,string)",
"function transferOwnership(string,address)"
]

const core = new ethers.Contract(
 process.env.CONTRACT_ADDRESS,
 CORE_ABI,
 wallet
)

/* ========================
   SHIELD CONTRACT
======================== */

const SHIELD_ABI = [
"function freeze(string)",
"function flag(string,string)"
]

const shield = new ethers.Contract(
 process.env.SHIELD_ADDRESS,
 SHIELD_ABI,
 wallet
)

/* ========================
   UI PAGE
======================== */

app.get("/", (req,res)=>{

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>ASJUJ Control Panel</title>

<style>
body{
 margin:0;
 font-family: 'Segoe UI', sans-serif;
 background: linear-gradient(135deg,#0f2027,#203a43,#2c5364);
 color:white;
 display:flex;
 justify-content:center;
 align-items:center;
 height:100vh;
}

.container{
 background: rgba(255,255,255,0.05);
 backdrop-filter: blur(15px);
 border-radius:20px;
 padding:40px;
 width:420px;
 box-shadow:0 0 40px rgba(0,0,0,0.5);
}

h1{
 text-align:center;
 margin-bottom:30px;
 font-weight:600;
 letter-spacing:1px;
}

input{
 width:100%;
 padding:12px;
 margin:8px 0;
 border:none;
 border-radius:10px;
 background:#111;
 color:white;
}

button{
 width:100%;
 padding:12px;
 margin-top:12px;
 border:none;
 border-radius:12px;
 background: linear-gradient(90deg,#00f2fe,#4facfe);
 color:black;
 font-weight:bold;
 cursor:pointer;
 transition:.3s;
}

button:hover{
 transform:scale(1.03);
 box-shadow:0 0 15px #4facfe;
}

.section{
 margin-top:25px;
 border-top:1px solid rgba(255,255,255,0.1);
 padding-top:20px;
}

.status{
 margin-top:15px;
 text-align:center;
 font-weight:bold;
}
</style>
</head>

<body>

<div class="container">

<h1>ASJUJ PANEL</h1>

<form method="POST" action="/create">

<input name="gpid" placeholder="GPID" required>
<input name="brand" placeholder="Brand" required>
<input name="model" placeholder="Model" required>
<input name="category" placeholder="Category" required>
<input name="factory" placeholder="Factory" required>
<input name="batch" placeholder="Batch" required>

<button>Create Product</button>

</form>


<div class="section">

<form method="POST" action="/transfer">

<input name="gpid" placeholder="GPID">
<input name="to" placeholder="New Owner Wallet">

<button>Transfer Ownership</button>

</form>

</div>


<div class="section">

<form method="POST" action="/freeze">

<input name="gpid" placeholder="GPID to Freeze">

<button>Freeze Product</button>

</form>

</div>


<div class="section">

<form method="POST" action="/flag">

<input name="gpid" placeholder="GPID to Flag">

<button>Flag Product</button>

</form>

</div>

</div>
</body>
</html>
`)
})


/* ========================
   ROUTES
======================== */

app.post("/create", async(req,res)=>{
 try{

  const { gpid,brand,model,category,factory,batch } = req.body

  const tx = await core.createProduct(
   gpid,brand,model,category,factory,batch
  )

  await tx.wait()

  res.send("✔ Product Created<br>TX: "+tx.hash)

 }catch(err){
  res.send("❌ "+(err.reason || err.message))
 }
})


app.post("/transfer", async(req,res)=>{
 try{

  const tx = await core.transferOwnership(
   req.body.gpid,
   req.body.to
  )

  await tx.wait()

  res.send("✔ Ownership Transferred<br>"+tx.hash)

 }catch(err){
  res.send("❌ "+(err.reason || err.message))
 }
})


app.post("/freeze", async(req,res)=>{
 try{

  const tx = await shield.freeze(req.body.gpid)
  await tx.wait()

  res.send("🧊 PRODUCT FROZEN")

 }catch(err){
  res.send("❌ "+(err.reason || err.message))
 }
})


app.post("/flag", async(req,res)=>{
 try{

  const tx = await shield.flag(req.body.gpid,"MANUAL_FLAG")
  await tx.wait()

  res.send("🚨 PRODUCT FLAGGED")

 }catch(err){
  res.send("❌ "+(err.reason || err.message))
 }
})


/* ========================
   SERVER
======================== */

app.listen(10000,()=>{
 console.log("🚀 ASJUJ PANEL LIVE")
})