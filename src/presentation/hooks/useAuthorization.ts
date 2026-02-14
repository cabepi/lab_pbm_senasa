import { useState } from 'react';
import type { AuthorizationRequest, AuthorizationResponse, Medication } from '../../domain/models/Authorization';
import type { AuthorizationRepository } from '../../domain/repositories/AuthorizationRepository';
import { UnipagoAuthorizationRepository } from '../../data/repositories/UnipagoAuthorizationRepository';
import { UnipagoAuthRepository } from '../../data/repositories/UnipagoAuthRepository';
import { FetchHttpClient } from '../../data/infrastructure/FetchHttpClient';

export const useAuthorization = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<AuthorizationResponse | null>(null);

    const validateAuthorization = async (
        affiliateId: string,
        medications: Medication[]
    ) => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            // Instantiate repositories (In a real app, use DI)
            const httpClient = new FetchHttpClient("/unipago");
            // Using empty string for baseUrl as it's handled by proxy or not needed for auth repo if only token is returned
            // Actually AuthRepo needs base URL too, or it might use the one from HttpClient if configured there?
            // Checking UnipagoAuthRepository, it takes baseUrl in constructor. 
            // UnipagoAffiliateRepository also takes baseUrl.
            // We'll pass empty string as the proxy handles /unipago prefix mapping if configured correctly,
            // or we rely on the HttpClient to have the base URL.
            // Looking at FetchHttpClient, it prepends its baseUrl.
            // So if we pass "/unipago" to FetchHttpClient, we don't need it in repo constructors if they append paths.
            const authRepo = new UnipagoAuthRepository(httpClient, "");
            const authRepository: AuthorizationRepository = new UnipagoAuthorizationRepository(httpClient, authRepo, "");

            // Generate a unique external authorization ID
            const externalAuthId = `NUM_REF_FARMACIA_20414_${Date.now()}`;

            const request: AuthorizationRequest = {
                CodigoFarmacia: "20414", // Hardcoded as per requirement
                ContratoAfiliado: affiliateId,
                CodigoProgramaPyP: 0,
                AutorizacionExterna: externalAuthId,
                Medicamentos: medications,
            };

            const result = await authRepository.validate(request);
            setResponse(result);

            if (result.ErrorNumber !== 1000) {
                setError(result.ErrorMessage || "Error en la validación de la autorización.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ocurrió un error al validar la autorización.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        response,
        validateAuthorization
    };
};
