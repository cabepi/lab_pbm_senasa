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
        pharmacy: { code: string; type: string; principal_code: string | null; name: string },
        medications: Medication[],
        pypCode: number = 0
    ) => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

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
                // For logic errors (200 OK but ErrorNumber != 1000), we still set response
                // to allow UI to handle it with the specific code.
                // We clear generic error since response handles it.
                setError(null);
            }

        } catch (err: any) {
            console.error("Validation Error:", err);

            // Check for the specific error structure seen in the screenshot
            // { "respuesta": { "codigo": 1002, "mensaje": "..." }, "errores": ["..."] }
            if (err.body && err.body.respuesta && err.body.respuesta.codigo) {
                const { respuesta, errores } = err.body;

                // Combine main message with list of errors
                let combinedMessage = respuesta.mensaje || "Error de validación";

                if (Array.isArray(errores) && errores.length > 0) {
                    combinedMessage += "\n\n" + errores.map((e: string) => `• ${e}`).join("\n");
                }

                setResponse({
                    ErrorNumber: respuesta.codigo,
                    ErrorMessage: combinedMessage,
                    NumeroAutorizacion: "", // No auth number on error
                    AutorizacionExterna: "",
                    // Add other required fields with defaults/nulls if strictly required by interface, 
                    // but State usually handles partial objects or we cast it. 
                    // Let's assume the interface is loose enough or we match the shape.
                } as AuthorizationResponse);

                setError(null);
            }
            // Fallback for flat ErrorNumber structure (if API changes or mixed responses)
            else if (err.body && err.body.ErrorNumber) {
                setResponse(err.body);
                setError(null);
            } else {
                // Generic fallback
                setError(err.message || "Ocurrió un error al validar la autorización.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setResponse(null);
    };

    return {
        isLoading,
        error,
        response,
        validateAuthorization,
        resetState
    };
};
