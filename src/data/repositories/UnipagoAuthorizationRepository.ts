import type { AuthorizationRequest, AuthorizationResponse } from "../../domain/models/Authorization";
import type { AuthorizationRepository } from "../../domain/repositories/AuthorizationRepository";
import type { HttpClient } from "../../domain/repositories/HttpClient";
import { UnipagoAuthRepository } from "./UnipagoAuthRepository";

export class UnipagoAuthorizationRepository implements AuthorizationRepository {
    private http: HttpClient;
    private authRepo: UnipagoAuthRepository;
    private baseUrl: string;

    constructor(http: HttpClient, authRepo: UnipagoAuthRepository, baseUrl: string) {
        this.http = http;
        this.authRepo = authRepo;
        this.baseUrl = baseUrl;
    }

    async validate(request: AuthorizationRequest): Promise<AuthorizationResponse> {
        const token = await this.authRepo.authenticate();

        try {
            const response = await this.http.post<AuthorizationResponse>(
                `${this.baseUrl}/api/Autorizacion/Validar`,
                request,
                {
                    Authorization: `Bearer ${token}`,
                }
            );
            return response;
        } catch (error: any) {
            // If the API returns an error structure within the catch block (depending on HttpClient implementation)
            // we might need to parse it. Assuming HttpClient throws on non-200, we rethrow or handle here.
            console.error("Error validating authorization:", error);
            throw error;
        }
    }
}
