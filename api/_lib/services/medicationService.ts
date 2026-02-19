import type { DbClient } from './authorizationService.js';

export async function searchMedications(db: DbClient, query: string) {
    const searchTerm = String(query).trim();
    const isNumeric = /^\d+$/.test(searchTerm);

    let sql = '';
    let params: any[] = [];

    if (isNumeric) {
        sql = `SELECT code, name, price FROM lab_pbm_senasa.medications WHERE code::text LIKE $1 LIMIT 50`;
        params = [`${searchTerm}%`];
    } else {
        sql = `SELECT code, name, price FROM lab_pbm_senasa.medications WHERE name ILIKE $1 LIMIT 50`;
        params = [`%${searchTerm}%`];
    }

    const result = await db.query(sql, params);
    return result.rows;
}
