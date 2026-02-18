import type { AuthorizationRequest, AuthorizationResponse } from "../../domain/models/Authorization";
import type { AuthorizationRepository, AuthorizationSaveParams } from "../../domain/repositories/AuthorizationRepository";
import type { HttpClient } from "../../domain/repositories/HttpClient";
import { UnipagoAuthRepository } from "./UnipagoAuthRepository";
import { FetchHttpClient } from "../infrastructure/FetchHttpClient";

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
            return this.mapResponse(response);
        } catch (error: any) {
            console.error("Error validating authorization:", error);
            throw error;
        }
    }

    async authorize(request: AuthorizationRequest): Promise<AuthorizationResponse> {
        const token = await this.authRepo.authenticate();

        try {
            const response = await this.http.post<any>(
                `${this.baseUrl}/api/Autorizacion/Autorizar`,
                request,
                {
                    Authorization: `Bearer ${token}`,
                }
            );
            return this.mapResponse(response);
        } catch (error: any) {
            console.error("Error authorizing:", error);
            throw error;
        }
    }

    async save(authorization: AuthorizationSaveParams): Promise<void> {
        try {
            // Use a fresh client with empty base URL to hit the local API directly
            // effectively bypassing the /unipago proxy prefix
            console.log('[DEBUG] Saving authorization to local API at /api/authorizations');
            const localHttp = new FetchHttpClient();
            await localHttp.post(
                '/api/authorizations',
                authorization,
                { 'Content-Type': 'application/json' }
            );
            console.log('[DEBUG] Authorization saved successfully');
        } catch (error) {
            console.error("Failed to save authorization record locally:", error);
            // We don't throw here to avoid blocking the user flow if saving stats fails
        }
    }

    private mapResponse(raw: any): AuthorizationResponse {
        // If the response follows the { respuesta: { codigo, mensaje }, ... } structure
        if (raw.respuesta) {
            return {
                ErrorNumber: raw.respuesta.codigo,
                ErrorMessage: raw.respuesta.mensaje,
                NumeroAutorizacion: raw.NumeroAutorizacion ?? raw.detalle?.CodigoAutorizacion?.toString(),
                respuesta: raw.respuesta,
                detalle: raw.detalle
            };
        }

        // Return as is if it already matches AuthorizationResponse or has flat structure
        return raw;
    }
}
