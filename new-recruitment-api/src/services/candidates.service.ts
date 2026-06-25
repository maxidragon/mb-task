import { Database } from "sqlite";
import { LegacyApiService } from "./legacy-api.service";
import { CreateCandidatePayload } from "../schemas/candidate.schema";

export class CandidatesService {
  constructor(
    private readonly db: Database,
    private readonly legacyApiService: LegacyApiService
  ) {}


  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      this.db.all(`SELECT * FROM Candidate ORDER BY id LIMIT ? OFFSET ?`, [limit, offset]),
      this.db.get(`SELECT COUNT(*) as count FROM Candidate`),
    ]);

    const candidateIds = candidates.map((c: any) => c.id);

    let jobOffersByCandidate: Record<number, any[]> = {};

    if (candidateIds.length > 0) {
      const placeholders = candidateIds.map(() => "?").join(", ");
      const jobOffers = await this.db.all(
        `SELECT cjo.candidate_id, jo.id, jo.title, jo.description, jo.salary_range, jo.location
         FROM CandidateJobOffer cjo
         JOIN JobOffer jo ON jo.id = cjo.job_offer_id
         WHERE cjo.candidate_id IN (${placeholders})`,
        candidateIds
      );

      jobOffersByCandidate = jobOffers.reduce((acc: Record<number, any[]>, row: any) => {
        if (!acc[row.candidate_id]) acc[row.candidate_id] = [];
        acc[row.candidate_id].push({
          id: row.id,
          title: row.title,
          description: row.description,
          salaryRange: row.salary_range,
          location: row.location,
        });
        return acc;
      }, {});
    }

    return {
      data: candidates.map((c: any) => ({
        ...c,
        jobOffers: jobOffersByCandidate[c.id] ?? [],
      })),
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    };
  }

  async create(payload: CreateCandidatePayload) {
    const {
      firstName,
      lastName,
      email,
      phone,
      yearsOfExperience,
      notes,
      consentDate,
      status,
      jobOfferIds,
    } = payload;

    const placeholders = jobOfferIds.map(() => "?").join(", ");
    const jobOffers = await this.db.all(
      `SELECT id FROM JobOffer WHERE id IN (${placeholders})`,
      jobOfferIds
    );

    if (jobOffers.length !== jobOfferIds.length) {
      throw new Error("JOB_OFFERS_NOT_FOUND");
    }

    // Legacy API first — if it fails, we skip DB insert to avoid discrepancies
    try {
      await this.legacyApiService.createCandidateInLegacyApi({
        firstName,
        lastName,
        email,
      });
    } catch {
      throw new Error("LEGACY_API_UNAVAILABLE");
    }

    try {
      const result = await this.db.run(
        `INSERT INTO Candidate (first_name, last_name, email, phone, years_of_experience, notes, status, consent_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          phone,
          yearsOfExperience,
          notes ?? null,
          status,
          consentDate,
        ]
      );

      const candidateId = result.lastID!;

      for (const jobOfferId of jobOfferIds) {
        await this.db.run(
          `INSERT INTO CandidateJobOffer (candidate_id, job_offer_id) VALUES (?, ?)`,
          [candidateId, jobOfferId]
        );
      }

      return candidateId;
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new Error("CANDIDATE_ALREADY_EXISTS");
      }
      throw error;
    }
  }
}
