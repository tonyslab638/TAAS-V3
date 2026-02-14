import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ================= CONFIG =================
const RPC = process.env.RPC_URL;
const CONTRACT = process.env.CONTRACT_ADDRESS;

// provider
const provider = new ethers.JsonRpcProvider(RPC);

// correct ABI for TaaSProductCore
const ABI = [
  "function getProduct(string) view returns(string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(CONTRACT, ABI, provider);

// ================= ROUTES =================

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
  <title>ASJUJ Verifier</title>
  </head>
  <body style="font-family:sans-serif;text-align:center;margin-top:100px;">
    <h1>ASJUJ PRODUCT VERIFIER</h1>
    <form action="/verify">
      <input name="gpid" placeholder="Enter GPID" style="padding:10px;width:300px"/>
      <br><br>
      <button style="padding:12px 30px">Verify</button>
    </form>
  </body>
  </html>
  `);
});

// VERIFY ROUTE
app.get("/verify", async (req, res) => {
  try {
    const gpid = req.query.gpid;

    if (!gpid) return res.send("Missing GPID");

    const data = await contract.getProduct(gpid);

    res.send(`
    <html>
    <body style="font-family:sans-serif;text-align:center;margin-top:80px;">
    <h2>✅ ASJUJ Verified Product</h2>

    <p><b>GPID:</b> ${data[0]}</p>
    <p><b>Brand:</b> ${data[1]}</p>
    <p><b>Model:</b> ${data[2]}</p>
    <p><b>Category:</b> ${data[3]}</p>
    <p><b>Factory:</b> ${data[4]}</p>
    <p><b>Batch:</b> ${data[5]}</p>
    <p><b>Born:</b> ${new Date(Number(data[6])*1000).toUTCString()}</p>
    <p><b>Issuer:</b> ${data[7]}</p>
    <p><b>Owner:</b> ${data[8]}</p>

    <br>
    <a href="/">Verify Another</a>
    </body>
    </html>
    `);

  } catch (err) {

    res.send(`
    <html>
    <body style="font-family:sans-serif;text-align:center;margin-top:80px;">
    <h2>❌ Product Not Found</h2>
    <p>This GPID is not registered on ASJUJ Network.</p>
    <br>
    <a href="/">Try Again</a>
    </body>
    </html>
    `);
  }
});

// start server
app.listen(PORT, () =>
  console.log("Verifier running on", PORT)
);