export interface DbClient {
    query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

export interface SaveAuthorizationData {
    authorization_code: string;
    transaction_id: string;
    pharmacy_code: string;
    pharmacy_name: string;
    affiliate_document: string;
    affiliate_name: string;
    total_amount: number;
    regulated_copay: number;
    authorized_amount: number;
    detail_json: any;
    authorizer_email: string;
    branch_code?: string;
    caller_name?: string;
    caller_document?: string;
    caller_phone?: string;
    prescription?: {
        prescriber_name: string;
        prescription_date: string;
        diagnosis: string;
        is_chronic: boolean;
        file_path?: string;
        prescription_type?: string;
    };
}

export async function getAuthorizations(db: DbClient) {
    const result = await db.query(
        `SELECT * FROM lab_pbm_senasa.authorizations ORDER BY created_at DESC LIMIT 100`
    );
    return result.rows;
}

export async function saveAuthorization(db: DbClient, data: SaveAuthorizationData) {
    // 1. Insert main authorization
    await db.query(
        `INSERT INTO lab_pbm_senasa.authorizations (
            authorization_code, transaction_id, pharmacy_code, pharmacy_name,
            affiliate_document, affiliate_name, total_amount, regulated_copay,
            authorized_amount, detail_json, authorizer_email, branch_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (authorization_code) DO NOTHING`,
        [
            data.authorization_code, data.transaction_id, data.pharmacy_code,
            data.pharmacy_name, data.affiliate_document, data.affiliate_name,
            data.total_amount, data.regulated_copay, data.authorized_amount,
            data.detail_json, data.authorizer_email, data.branch_code || null
        ]
    );

    // 2. Insert caller info if provided
    if (data.caller_name && data.caller_document && data.caller_phone) {
        await db.query(
            `INSERT INTO lab_pbm_senasa.authorization_callers (
                authorization_code, caller_name, caller_document, caller_phone
            ) VALUES ($1, $2, $3, $4)`,
            [data.authorization_code, data.caller_name, data.caller_document, data.caller_phone]
        );
    }

    // 3. Insert prescription info if provided
    if (data.prescription) {
        const p = data.prescription;
        await db.query(
            `INSERT INTO lab_pbm_senasa.prescriptions (
                authorization_code, prescriber_name, prescription_date,
                diagnosis, is_chronic, file_path, prescription_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                data.authorization_code, p.prescriber_name, p.prescription_date,
                p.diagnosis, p.is_chronic || false, p.file_path || null,
                p.prescription_type || 'NORMAL'
            ]
        );
    }
}
