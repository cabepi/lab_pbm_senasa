import type { AuthorizationRequest, AuthorizationResponse } from "../models/Authorization";

export interface AuthorizationRepository {
    validate(request: AuthorizationRequest): Promise<AuthorizationResponse>;
    authorize(request: AuthorizationRequest): Promise<AuthorizationResponse>;
    save(authorization: any): Promise<void>;
}
