import { Request, Response, Router } from "express";
import { CandidatesService } from "../services/candidates.service";
import { createCandidateSchema, listCandidatesSchema } from "../schemas/candidate.schema";
import { z } from "zod";

export class CandidatesController {
    readonly router = Router();

    constructor(private readonly candidatesService: CandidatesService) {
        this.router.get('/candidates', this.getAll.bind(this));
        this.router.post('/candidates', this.create.bind(this));
    }

    async getAll(req: Request, res: Response) {
        const parsed = listCandidatesSchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation failed", errors: z.treeifyError(parsed.error)});
        }
        const { page, limit } = parsed.data;
        const result = await this.candidatesService.findAll(page, limit);
        return res.status(200).json(result);
    }

    async create(req: Request, res: Response) {
        const parsed = createCandidateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Validation failed", errors: z.treeifyError(parsed.error)});
        }

        try {
            const candidateId = await this.candidatesService.create(parsed.data);
            return res.status(201).json({ id: candidateId });
        } catch (error: any) {
            switch (error.message) {
                case "JOB_OFFERS_NOT_FOUND":
                    return res.status(400).json({ message: "One or more jobOfferIds do not exist" });
                case "CANDIDATE_ALREADY_EXISTS":
                    return res.status(409).json({ message: "Candidate with this email already exists" });
                case "LEGACY_API_UNAVAILABLE":
                    return res.status(503).json({ message: "Legacy API unavailable" });
                default:
                    return res.status(500).json({ message: "Internal server error" });
            }
        }
    }
}
