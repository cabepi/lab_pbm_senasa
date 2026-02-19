import type { DbClient } from './authorizationService.js';

export interface TraceData {
    created_at?: Date | string;
    transaction_id: string;
    user_email: string;
    action_type: string;
    response_code: number;
    duration_ms?: number;
    pharmacy_code: string;
    branch_code?: string;
    authorization_code?: string;
    affiliate?: {
        document?: string;
        nss?: string;
        first_name?: string;
        last_name?: string;
        regimen?: string;
        status?: string;
    };
    payload_input?: any;
    payload_output?: any;
}

export async function getTraces(db: DbClient) {
    const result = await db.query(
        `SELECT 
            t.*,
            COALESCE(t.authorization_code, a.authorization_code) as authorization_code
         FROM lab_pbm_senasa.authorization_traces t
         LEFT JOIN lab_pbm_senasa.authorizations a ON t.transaction_id = a.transaction_id
         ORDER BY t.created_at DESC 
         LIMIT 500`
    );
    return result.rows;
}

export async function registerTrace(db: DbClient, trace: TraceData, userIp: string | null) {
    await db.query(
        `INSERT INTO lab_pbm_senasa.authorization_traces (
            created_at, transaction_id, user_email, user_ip,
            action_type, response_code, duration_ms,
            pharmacy_code, branch_code, authorization_code,
            affiliate_document, affiliate_nss,
            affiliate_first_name, affiliate_last_name,
            affiliate_regimen, affiliate_status,
            payload_input, payload_output
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
            trace.created_at || new Date(),
            trace.transaction_id,
            trace.user_email,
            userIp,
            trace.action_type,
            trace.response_code,
            trace.duration_ms,
            trace.pharmacy_code,
            trace.branch_code,
            trace.authorization_code,
            trace.affiliate?.document,
            trace.affiliate?.nss,
            trace.affiliate?.first_name,
            trace.affiliate?.last_name,
            trace.affiliate?.regimen,
            trace.affiliate?.status,
            trace.payload_input,
            trace.payload_output
        ]
    );
}
