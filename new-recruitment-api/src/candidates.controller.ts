import { Request, Response, Router } from "express";
import { Database } from "sqlite";

export class CandidatesController {
    readonly router = Router();

    constructor(private readonly db: Database) {
        this.router.get('/candidates', this.getAll.bind(this));
        this.router.post('/candidates', this.create.bind(this));
    }

    getAll(req: Request, res: Response) {
        console.log(x);
        var x = 1;
        res.json([]);
    }

    create(req: Request, res: Response) {
        res.json({});
    }
}
