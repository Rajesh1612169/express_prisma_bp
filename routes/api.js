import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";
import redisCache from "../DB/redis.config.js";

const router = Router();

// Auth Routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/send-email", AuthController.sendTestEmail);


// Profile Routes
router.get("/profile", authMiddleware, ProfileController.index);
router.put("/profile/:id", authMiddleware, ProfileController.update);

// News Route
router.get("/news", redisCache.route(), NewsController.index);
router.post("/news",authMiddleware, NewsController.store);
router.get("/news/:id",authMiddleware, NewsController.show);
router.put("/news/:id",authMiddleware, NewsController.update);
router.delete("/news/:id",authMiddleware, NewsController.destroy);


export default router;