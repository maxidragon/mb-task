import express from "express";
import { Database } from "sqlite";
import { LegacyApiService } from "./services/legacy-api.service";
import { CandidatesService } from "./services/candidates.service";
import { CandidatesController } from "./controllers/candidates.controller";

export const setupApp = async (db: Database) => {
    const app = express();

    app.use(express.json());

    const legacyApiService = new LegacyApiService();
    const candidatesService = new CandidatesService(db, legacyApiService);
    app.use(new CandidatesController(candidatesService).router);

    return app;
}
