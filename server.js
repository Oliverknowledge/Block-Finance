import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

app.get("/api/coin", async (req, res) => {
  try {
    const coinId = req.query.id || req.query.symbol?.toLowerCase();

    const response = await axios.get(
      `https://api.coincap.io/v2/assets/${coinId}`
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coin data from CoinCap" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
