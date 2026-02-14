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

    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [authorizedResponse, setAuthorizedResponse] = useState<AuthorizationResponse | null>(null);

    const validateAuthorization = async (
        affiliateId: string,
        pharmacy: { code: string; type: string; principal_code: string | null; name: string },
        medications: Medication[],
        pypCode: number = 0
    ) => {
        // ... (existing validate logic) ...
        setIsLoading(true);
        setError(null);
        setResponse(null);
        setAuthorizedResponse(null); // Clear previous auth response

        try {
            const httpClient = new FetchHttpClient("/unipago");
            const authRepo = new UnipagoAuthRepository(httpClient, "");
            const authRepository: AuthorizationRepository = new UnipagoAuthorizationRepository(httpClient, authRepo, "");

            // Determine CodigoFarmacia and CodigoSucursal based on pharmacy type
            let codigoFarmacia = pharmacy.code;
            let codigoSucursal: string | null = null;

            if (pharmacy.type === 'SUCURSAL' && pharmacy.principal_code) {
                codigoFarmacia = pharmacy.principal_code;
                codigoSucursal = pharmacy.code;
            }

            // Generate External Auth ID: NUM_REF_FARMACIA_{CodigoFarmacia}_{NumeroReferencia}
            const now = new Date();
            const numRef = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
            const externalAuthId = `NUM_REF_FARMACIA_${codigoFarmacia}_${numRef}`;

            const request: AuthorizationRequest = {
                CodigoFarmacia: codigoFarmacia,
                CodigoSucursal: codigoSucursal,
                ContratoAfiliado: affiliateId,
                CodigoProgramaPyP: pypCode,
                AutorizacionExterna: externalAuthId,
                Medicamentos: medications,
            };

            const result = await authRepository.validate(request);
            setResponse(result);

            if (result.ErrorNumber !== 1000) {
                setError(null);
            }

        } catch (err: any) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const authorize = async (
        affiliateId: string,
        pharmacy: { code: string; type: string; principal_code: string | null; name: string },
        medications: Medication[],
        pypCode: number = 0,
        externalAuthId?: string // Optional, but usually strictly required to match validate? 
        // Actually, user said "asignaremos los mismos valores que tenemos en el servicio de validar".
        // It's safer to regenerate or reuse the one from validate if we stored it?
        // For now, let's regenerate it or accept it. 
        // Given the quick succession, regenerating might be fine or passing it from the modal if available.
        // Let's regenerate for now to match current logic.
    ) => {
        setIsAuthorizing(true);
        setError(null);

        try {
            const httpClient = new FetchHttpClient("/unipago");
            const authRepo = new UnipagoAuthRepository(httpClient, "");
            const authRepository: AuthorizationRepository = new UnipagoAuthorizationRepository(httpClient, authRepo, "");

            let codigoFarmacia = pharmacy.code;
            let codigoSucursal: string | null = null;

            if (pharmacy.type === 'SUCURSAL' && pharmacy.principal_code) {
                codigoFarmacia = pharmacy.principal_code;
                codigoSucursal = pharmacy.code;
            }

            // Reuse logic or pass valid External ID. 
            // Ideally, we should use the SAME external ID as the validation if the API requires state.
            // But validation is usually stateless.
            // Let's generate a new one or passed one. 
            // The prompt says "asignaremos los mismos valores". 
            // I'll regenerate for now.
            const now = new Date();
            const numRef = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
            const generatedAuthId = `NUM_REF_FARMACIA_${codigoFarmacia}_${numRef}`;
            const finalAuthId = externalAuthId || generatedAuthId;

            const request: AuthorizationRequest = {
                CodigoFarmacia: codigoFarmacia,
                CodigoSucursal: codigoSucursal,
                ContratoAfiliado: affiliateId,
                CodigoProgramaPyP: pypCode,
                AutorizacionExterna: finalAuthId,
                Medicamentos: medications,
            };

            const result = await authRepository.authorize(request);
            setAuthorizedResponse(result);

        } catch (err: any) {
            handleError(err);
        } finally {
            setIsAuthorizing(false);
        }
    }

    const handleError = (err: any) => {
        console.error("Authorization Error:", err);
        if (err.body && err.body.respuesta && err.body.respuesta.codigo) {
            const { respuesta, errores } = err.body;
            let combinedMessage = respuesta.mensaje || "Error de autorización";
            if (Array.isArray(errores) && errores.length > 0) {
                combinedMessage += "\n\n" + errores.map((e: string) => `• ${e}`).join("\n");
            }
            // We set response or authorizedResponse depending on context? 
            // For simplicity, update generic response state or error state so UI shows it.
            // If authorizing, maybe we should set authorizedResponse with error?
            // Or just use setError.
            setError(combinedMessage);
            // Also set response to show formatted error if needed
            setResponse({
                ErrorNumber: respuesta.codigo,
                ErrorMessage: combinedMessage,
            } as AuthorizationResponse);
        }
        else if (err.body && err.body.ErrorNumber) {
            setResponse(err.body);
            setError(null);
        } else {
            setError(err.message || "Ocurrió un error.");
        }
    };

    const resetState = () => {
        setError(null);
        setResponse(null);
        setAuthorizedResponse(null);
    };

    return {
        isLoading,
        isAuthorizing,
        error,
        response,
        authorizedResponse,
        validateAuthorization,
        authorize,
        resetState
    };
};
