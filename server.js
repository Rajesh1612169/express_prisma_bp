import express from 'express';
import "dotenv/config"
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 8000;
import { limiter } from './config/ratelimiter.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors({
    origin: "http://localhost:8000"
}));
app.use(limiter)

app.get("/", (req, res) => {
    return res.json({ message: "Hello from server..." })
})

// Import Routes
import ApiRoutes from './routes/api.js'
app.use("/api", ApiRoutes);

//Jobs import
import "./jobs/index.js";

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))
