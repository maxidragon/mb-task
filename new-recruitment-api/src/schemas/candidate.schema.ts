import { z } from "zod";

export const createCandidateSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    phone: z.string().min(1),
    yearsOfExperience: z.number().int().min(0),
    notes: z.string().optional(),
    consentDate: z.iso.datetime(),
    status: z.enum(['nowy', 'w trakcie rozmów', 'zaakceptowany', 'odrzucony']).default('nowy'),
    jobOfferIds: z.array(z.number().int().positive()).min(1),
});

export type CreateCandidatePayload = z.infer<typeof createCandidateSchema>;

export const listCandidatesSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListCandidatesQuery = z.infer<typeof listCandidatesSchema>;
