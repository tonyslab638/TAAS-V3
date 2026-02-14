import express from "express";
import { ethers } from "ethers";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ================= ENV =================

const RPC = process.env.RPC;
const CONTRACT = process.env.CONTRACT;

if (!RPC || !CONTRACT) {
  console.log("❌ Missing ENV variables");
  console.log("RPC:", RPC ? "OK" : "MISSING");
  console.log("CONTRACT:", CONTRACT ? "OK" : "MISSING");
}

const provider = new ethers.JsonRpcProvider(RPC);

const ABI = [
  "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(CONTRACT, ABI, provider);

console.log("===================================");
console.log("TAAS VERIFIER V3 LIVE");
console.log("RPC:", RPC ? "OK" : "MISSING");
console.log("Contract:", CONTRACT);
console.log("===================================");


// ================= UI PAGE =================

app.get("/", (req, res) => {
res.send(`
<html>
<head>
<title>ASJUJ Verification</title>

<script src="https://unpkg.com/html5-qrcode"></script>

<style>
body{
font-family:Arial;
background:linear-gradient(135deg,#050505,#111,#050505);
color:white;
text-align:center;
padding-top:60px;
}

.card{
background:#111;
padding:30px;
border-radius:18px;
width:380px;
margin:auto;
box-shadow:0 0 40px rgba(0,255,255,.15);
}

input{
padding:12px;
width:85%;
border-radius:10px;
border:none;
margin-top:15px;
}

button{
padding:12px 25px;
margin-top:20px;
border:none;
border-radius:10px;
background:cyan;
font-weight:bold;
cursor:pointer;
}

#reader{
margin-top:20px;
}
</style>
</head>

<body>

<div class="card">
<h2>ASJUJ Product Verification</h2>

<form method="POST" action="/verify">
<input name="gpid" placeholder="Enter GPID" required/>
<br>
<button>Verify</button>
</form>

<h3>OR</h3>
<button onclick="startScanner()">Scan QR</button>

<div id="reader"></div>
</div>

<script>
function startScanner(){
const scanner = new Html5Qrcode("reader");

scanner.start(
{ facingMode: "environment" },
{ fps: 10, qrbox: 250 },
(decoded)=>{
window.location="/verify?gpid="+decoded;
}
);
}
</script>

</body>
</html>
`);
});


// ================= VERIFY =================

app.get("/verify", async (req,res)=>{
const gpid = req.query.gpid;

if(!gpid) return res.send("Missing GPID");

try{

const p = await contract.getProduct(gpid);

res.send(`
<h2>ASJUJ Verified Product</h2>
GPID: ${p[0]} <br><br>
Brand: ${p[1]} <br>
Model: ${p[2]} <br>
Category: ${p[3]} <br>
Factory: ${p[4]} <br>
Batch: ${p[5]} <br>
Born: ${new Date(Number(p[6])*1000).toUTCString()} <br><br>
Issuer: ${p[7]} <br>
Owner: ${p[8]} <br><br>

<b style="color:lime">AUTHENTIC PRODUCT</b>
<br><br>
<a href="/">Verify Another</a>
`);

}catch(e){
res.send(`
<h2>Product Not Found</h2>
This GPID is not registered on ASJUJ Network.
<br><br>
<a href="/">Try Again</a>
`);
}

});


// ================= START =================

app.listen(PORT,()=>{
console.log("Verifier running on",PORT);
});