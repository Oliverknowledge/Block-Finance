import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

app.get("/api/coin", async (req, res) => {
  try {
    const symbol = req.query.symbol;

    const API_KEY = process.env.CMC_API_KEY;
    const endpoint = "v1/cryptocurrency/listings/latest";

    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/${endpoint}?symbol=${symbol}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
