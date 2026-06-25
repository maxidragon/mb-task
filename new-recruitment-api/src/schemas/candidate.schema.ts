import { z } from "zod";

export const createCandidateSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    phone: z.string().min(1),
    yearsOfExperience: z.number().int().min(0),
    notes: z.string().optional(),
    consentDate: z.iso.datetime(),
    jobOfferIds: z.array(z.number().int().positive()).min(1),
});

export type CreateCandidatePayload = z.infer<typeof createCandidateSchema>;
