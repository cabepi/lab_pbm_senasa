import type { AuthorizationRequest, AuthorizationResponse } from "../models/Authorization";

export interface AuthorizationRepository {
    validate(request: AuthorizationRequest): Promise<AuthorizationResponse>;
}
