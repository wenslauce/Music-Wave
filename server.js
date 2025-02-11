import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());

app.get("/api/deezer/*", async (req, res) => {
    try {
        const apiUrl = `https://api.deezer.com/${req.params[0]}`;
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: "Error fetching data" });
    }
});

app.listen(5000, () => console.log("Proxy server running on port 5000")); 