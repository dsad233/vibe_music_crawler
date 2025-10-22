import express from "express";
import { VibeController } from "./vibe.controller.js";
import { AsyncWrapper } from "../../src/common/middlewares/asyncWrapper.js";

const router = express.Router();

const vibeController = new VibeController();

// 신규 앨범
router.get("/albums/new/excel", AsyncWrapper(vibeController.newAlbums));

// 노래 급상승
router.get("/songs/hot/excel", AsyncWrapper(vibeController.hotSongs));

// 주목할 최신곡
router.get("/songs/new/excel", AsyncWrapper(vibeController.toDaySongs));

export default router;
