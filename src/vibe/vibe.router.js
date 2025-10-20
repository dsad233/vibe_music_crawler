import express from "express";
import { VibeController } from "./vibe.controller.js";
import { asyncWrapper } from "../../src/common/middlewares/asyncWrapper.js";

const router = express.Router();

const vibeController = new VibeController();

// 신규 앨범
router.get("/albums/new/excel", asyncWrapper(vibeController.newAlbums));

// 노래 급상승
router.get("/songs/hot/excel", asyncWrapper(vibeController.hotSongs));

// 주목할 최신곡
router.get("/songs/new/excel", asyncWrapper(vibeController.toDaySongs));

export default router;
