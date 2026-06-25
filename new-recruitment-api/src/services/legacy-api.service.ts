const LEGACY_API_URL = process.env.LEGACY_API_URL;
const LEGACY_API_KEY = process.env.LEGACY_API_KEY;
const MAX_RETRIES = 3;

interface LegacyCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
}

export class LegacyApiService {
  async createCandidateInLegacyApi(
    payload: LegacyCandidatePayload
  ): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(`${LEGACY_API_URL}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LEGACY_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 504 && attempt < MAX_RETRIES) {
        console.warn(`Attempt ${attempt} failed with 504. Retrying...`);
        continue;
      }
      if (response.status === 409) {
        console.warn(
          `Attempt ${attempt} failed with 409. Candidate already exists.`
        );
        return;
      }
      if (!response.ok) {
        throw new Error(
          `Failed to create candidate in legacy API. Status: ${response.status}`
        );
      }
    }

    throw new Error(`Legacy API unavailable after ${MAX_RETRIES} attempts`);
  }
}
