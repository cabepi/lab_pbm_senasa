

export type TraceActionType = 'VALIDATION' | 'AUTHORIZATION';

export interface AffiliateSnapshot {
    document: string;
    nss: string | null;
    first_name: string;
    last_name: string;
    regimen: string | null;
    status: string | null;
}

export interface TransactionTrace {
    id?: string;
    transaction_id: string; // Groups validation + authorization logic
    created_at: Date;

    // System Audit
    user_email: string;
    user_ip?: string;
    action_type: TraceActionType;
    response_code: number;
    duration_ms: number;

    // Provider Context
    pharmacy_code: string;
    branch_code?: string;
    authorization_code?: string;

    // Affiliate Snapshot
    affiliate: AffiliateSnapshot;

    // Payloads
    payload_input: object;
    payload_output: object;
}
