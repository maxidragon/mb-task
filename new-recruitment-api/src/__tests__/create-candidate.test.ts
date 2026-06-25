import request from "supertest";
import { Application } from "express";
import { setupApp } from "../app";
import { setupDb } from "../db";

jest.mock("../services/legacy-api.service", () => ({
    LegacyApiService: jest.fn().mockImplementation(() => ({
        createCandidateInLegacyApi: jest.fn().mockResolvedValue(undefined),
    })),
}));

const validPayload = {
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jest_jan_kowalski@example.com",
    phone: "600-100-200",
    yearsOfExperience: 3,
    consentDate: "2025-01-10T10:00:00Z",
    jobOfferIds: [1],
};

describe("POST /candidates", () => {
    let app: Application;

    beforeEach(async () => {
        const db = await setupDb();
        app = await setupApp(db);
    });

    it("should create a candidate successfully", async () => {
        const res = await request(app).post("/candidates").send(validPayload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
    });

    it("should return 400 when required fields are missing", async () => {
        const res = await request(app).post("/candidates").send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 when email is invalid", async () => {
        const res = await request(app)
            .post("/candidates")
            .send({ ...validPayload, email: "not-an-email" });

        expect(res.status).toBe(400);
    });

    it("should return 400 when jobOfferIds is empty", async () => {
        const res = await request(app)
            .post("/candidates")
            .send({ ...validPayload, jobOfferIds: [] });

        expect(res.status).toBe(400);
    });

    it("should return 400 when jobOfferIds do not exist", async () => {
        const res = await request(app)
            .post("/candidates")
            .send({ ...validPayload, jobOfferIds: [99999] });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("One or more jobOfferIds do not exist");
    });

    it("should return 409 when candidate with email already exists", async () => {
        await request(app).post("/candidates").send(validPayload);
        const res = await request(app).post("/candidates").send(validPayload);

        expect(res.status).toBe(409);
    });

    it("should return 503 when legacy API is unavailable", async () => {
        const { LegacyApiService } = require("../services/legacy-api.service");
        LegacyApiService.mockImplementationOnce(() => ({
            createCandidateInLegacyApi: jest.fn().mockRejectedValue(new Error("LEGACY_API_UNAVAILABLE")),
        }));

        const db = await setupDb();
        const appWithFailingLegacy = await setupApp(db);

        const res = await request(appWithFailingLegacy).post("/candidates").send(validPayload);

        expect(res.status).toBe(503);
    });
});
