CREATE TABLE Candidate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    years_of_experience INTEGER NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'nowy'
        CHECK(status IN ('nowy', 'w trakcie rozmów', 'zaakceptowany', 'odrzucony')),
    consent_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CandidateJobOffer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    job_offer_id INTEGER NOT NULL,
    FOREIGN KEY (candidate_id) REFERENCES Candidate(id),
    FOREIGN KEY (job_offer_id) REFERENCES JobOffer(id),
    UNIQUE(candidate_id, job_offer_id)
);