import type { DbClient } from './authorizationService.js';

export async function searchPharmacies(db: DbClient, query: string) {
    const searchTerm = `%${query}%`;
    const result = await db.query(
        `SELECT code, name, principal_code, type 
         FROM lab_pbm_senasa.pharmacies 
         WHERE code::text ILIKE $1 
            OR name ILIKE $1 
            OR principal_code::text ILIKE $1 
            OR type ILIKE $1
         ORDER BY name
         LIMIT 50`,
        [searchTerm]
    );
    return result.rows;
}
