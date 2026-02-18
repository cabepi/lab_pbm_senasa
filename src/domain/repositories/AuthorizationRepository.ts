import type { AuthorizationRequest, AuthorizationResponse } from "../models/Authorization";

export interface AuthorizationSaveParams {
    authorization_code: string;
    transaction_id: string;
    pharmacy_code: string;
    pharmacy_name: string | null;
    affiliate_document: string;
    affiliate_name: string | null;
    total_amount: number;
    regulated_copay: number;
    authorized_amount: number;
    detail_json: any;
    authorizer_email: string;
    branch_code?: string | null;
    caller_name?: string;
    caller_document?: string;
    caller_phone?: string;
    prescription?: {
        prescriber_name: string;
        prescription_date: string;
        diagnosis: string;
        is_chronic: boolean;
        file_path?: string;
        prescription_type?: 'NORMAL' | 'PYP' | 'EMERGENCY';
    };
}

export interface AuthorizationRepository {
    validate(request: AuthorizationRequest): Promise<AuthorizationResponse>;
    authorize(request: AuthorizationRequest): Promise<AuthorizationResponse>;
    save(authorization: AuthorizationSaveParams): Promise<void>;
}
