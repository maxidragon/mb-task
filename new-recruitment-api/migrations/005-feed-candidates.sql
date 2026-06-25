INSERT INTO Candidate (first_name, last_name, email, phone, years_of_experience, notes, status, consent_date)
VALUES
    ('Jan', 'Kowalski', 'jan.kowalski@example.com', '600-100-200', 3, 'Dobry kandydat', 'nowy', '2025-01-10T10:00:00Z'),
    ('Anna', 'Nowak', 'anna.nowak@example.com', '601-200-300', 5, NULL, 'w trakcie rozmów', '2025-01-12T09:00:00Z'),
    ('Piotr', 'Wiśniewski', 'piotr.wisniewski@example.com', '602-300-400', 8, 'Senior z doświadczeniem w AWS', 'zaakceptowany', '2025-01-15T11:00:00Z'),
    ('Katarzyna', 'Wójcik', 'katarzyna.wojcik@example.com', '603-400-500', 1, NULL, 'odrzucony', '2025-01-18T14:00:00Z'),
    ('Marek', 'Kowalczyk', 'marek.kowalczyk@example.com', '604-500-600', 4, 'Zna TypeScript i React', 'nowy', '2025-01-20T08:00:00Z');

INSERT INTO CandidateJobOffer (candidate_id, job_offer_id) VALUES
    (1, 1),
    (2, 2),
    (2, 6),
    (3, 5),
    (4, 3),
    (5, 1),
    (5, 9);
