import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AuthorizationRequest, AuthorizationResponse, Medication } from '../../domain/models/Authorization';
import type { AuthorizationRepository } from '../../domain/repositories/AuthorizationRepository';
import { UnipagoAuthorizationRepository } from '../../data/repositories/UnipagoAuthorizationRepository';
import { UnipagoAuthRepository } from '../../data/repositories/UnipagoAuthRepository';
import { FetchHttpClient } from '../../data/infrastructure/FetchHttpClient';
import { HttpTraceabilityRepository } from '../../data/repositories/HttpTraceabilityRepository';
import type { TraceabilityRepository } from '../../domain/repositories/TraceabilityRepository';
import type { AffiliateSnapshot, TransactionTrace } from '../../domain/models/Traceability';

export const useAuthorization = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<AuthorizationResponse | null>(null);
    const { user } = useAuth();

    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [authorizedResponse, setAuthorizedResponse] = useState<AuthorizationResponse | null>(null);

    const validateAuthorization = async (
        affiliateId: string,
        pharmacy: { code: string; type: string; principal_code: string | null; name: string },
        medications: Medication[],
        pypCode: number = 0,
        transactionId: string, // Transaction ID for traceability
        affiliateData?: AffiliateSnapshot // Require affiliate data for trace
    ) => {
        const now = new Date();
        let traceResult: AuthorizationResponse | null = null;
        let traceError: any = null;
        let request: AuthorizationRequest | null = null;
        let externalAuthId: string | null = null;

        setIsLoading(true);
        setError(null);
        setResponse(null);
        setAuthorizedResponse(null); // Clear previous auth response

        try {
            const envUrl = import.meta.env.VITE_API_BASE_URL;
            const apiBase = envUrl
                ? (envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`)
                : '/api';

            const unipagoBase = `${apiBase}/unipago`;

            const httpClient = new FetchHttpClient(unipagoBase);
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
            const numRef = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
            externalAuthId = `NUM_REF_FARMACIA_${codigoFarmacia}_${numRef}`;

            request = {
                CodigoFarmacia: codigoFarmacia,
                CodigoSucursal: codigoSucursal,
                ContratoAfiliado: affiliateId,
                CodigoProgramaPyP: pypCode,
                AutorizacionExterna: externalAuthId,
                Medicamentos: medications,
            };

            const result = await authRepository.validate(request);
            traceResult = result;
            setResponse(result);

            if (result.ErrorNumber !== 1000) {
                setError(null);
            }

        } catch (err: any) {
            traceError = err;
            handleError(err);
        } finally {
            setIsLoading(false);

            // Async Traceability Log
            if (affiliateData) {
                const endTime = new Date();
                const duration = endTime.getTime() - now.getTime();

                try {
                    // Use empty base URL to hit local proxy /api/traces/register
                    const traceRepo: TraceabilityRepository = new HttpTraceabilityRepository(new FetchHttpClient(""));

                    const trace: TransactionTrace = {
                        created_at: now,
                        transaction_id: transactionId,
                        user_email: user?.email || "unknown",
                        // user_ip handled by backend
                        action_type: 'VALIDATION',
                        response_code: traceResult?.ErrorNumber || (traceError ? 500 : 0),
                        duration_ms: duration,
                        pharmacy_code: pharmacy.principal_code || pharmacy.code,
                        branch_code: pharmacy.type === 'SUCURSAL' ? pharmacy.code : undefined,
                        affiliate: {
                            document: affiliateData.document,
                            nss: affiliateData.nss,
                            first_name: affiliateData.first_name,
                            last_name: affiliateData.last_name,
                            regimen: affiliateData.regimen,
                            status: affiliateData.status
                        },
                        payload_input: request || {
                            CodigoFarmacia: pharmacy.principal_code || pharmacy.code,
                            CodigoSucursal: pharmacy.type === 'SUCURSAL' ? pharmacy.code : null,
                            ContratoAfiliado: affiliateId,
                            CodigoProgramaPyP: pypCode,
                            AutorizacionExterna: externalAuthId || "", // We miss the exact ID if we don't lift 'request' properly. 
                            Medicamentos: medications
                        },
                        payload_output: traceResult || traceError || {}
                    };

                    await traceRepo.save(trace);
                } catch (e) {
                    console.error("Trace error during validation:", e);
                }
            }
        }
    };

    const authorize = async (
        affiliateId: string,
        pharmacy: { code: string; type: string; principal_code: string | null; name: string },
        medications: Medication[],
        pypCode: number = 0,
        transactionId: string,
        externalAuthId?: string,
        affiliateData?: AffiliateSnapshot, // Capture affiliate data
        callerInfo?: { name: string; documentId: string; phone: string } | null,
        prescriptionData?: {
            prescriber_name: string;
            prescription_date: string;
            diagnosis: string;
            is_chronic: boolean;
            file_path?: string;
            prescription_type?: 'NORMAL' | 'PYP' | 'EMERGENCY';
        }
    ) => {
        const now = new Date();
        let traceResult: AuthorizationResponse | null = null;
        let traceError: any = null;
        let request: AuthorizationRequest | null = null;

        setIsAuthorizing(true);
        setError(null);

        try {
            const envUrl = import.meta.env.VITE_API_BASE_URL;
            const apiBase = envUrl
                ? (envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`)
                : '/api';

            const unipagoBase = `${apiBase}/unipago`;

            const httpClient = new FetchHttpClient(unipagoBase);
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
            const numRef = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
            const generatedAuthId = `NUM_REF_FARMACIA_${codigoFarmacia}_${numRef}`;
            const finalAuthId = externalAuthId || generatedAuthId;

            request = {
                CodigoFarmacia: codigoFarmacia,
                CodigoSucursal: codigoSucursal,
                ContratoAfiliado: affiliateId,
                CodigoProgramaPyP: pypCode,
                AutorizacionExterna: finalAuthId,
                Medicamentos: medications,
            };

            const result = await authRepository.authorize(request);
            traceResult = result;
            setAuthorizedResponse(result);

            // Save successful authorization to local DB
            if (result.ErrorNumber === 1000 && result.detalle && affiliateData) {
                try {
                    await authRepository.save({
                        authorization_code: String(result.detalle.CodigoAutorizacion),
                        transaction_id: transactionId,
                        pharmacy_code: codigoFarmacia,
                        pharmacy_name: pharmacy.name,
                        affiliate_document: affiliateData.document,
                        affiliate_name: `${affiliateData.first_name} ${affiliateData.last_name}`,
                        total_amount: result.detalle.TotalFactura,
                        regulated_copay: result.detalle.MontoCopago,
                        authorized_amount: result.detalle.MontoAutorizado,
                        detail_json: result,
                        authorizer_email: user?.email || 'unknown',
                        branch_code: codigoSucursal,
                        caller_name: callerInfo?.name,
                        caller_document: callerInfo?.documentId,
                        caller_phone: callerInfo?.phone,
                        prescription: prescriptionData
                    });
                } catch (saveError) {
                    console.error("Error saving authorization record:", saveError);
                    // Non-blocking error
                }
            }

        } catch (err: any) {
            traceError = err;
            handleError(err);
        } finally {
            setIsAuthorizing(false);

            // Async Traceability Log
            if (affiliateData) {
                const endTime = new Date();
                const duration = endTime.getTime() - now.getTime();

                try {
                    // Use empty base URL to hit local proxy /api/traces/register
                    const traceRepo: TraceabilityRepository = new HttpTraceabilityRepository(new FetchHttpClient(""));

                    const trace: TransactionTrace = {
                        created_at: now,
                        transaction_id: transactionId,
                        user_email: user?.email || "unknown",
                        action_type: 'AUTHORIZATION',
                        response_code: traceResult?.ErrorNumber || (traceError ? 500 : 0),
                        duration_ms: duration,
                        pharmacy_code: pharmacy.principal_code || pharmacy.code,
                        branch_code: pharmacy.type === 'SUCURSAL' ? pharmacy.code : undefined,
                        authorization_code: traceResult?.detalle?.CodigoAutorizacion ? String(traceResult.detalle.CodigoAutorizacion) : undefined,
                        affiliate: {
                            document: affiliateData.document,
                            nss: affiliateData.nss,
                            first_name: affiliateData.first_name,
                            last_name: affiliateData.last_name,
                            regimen: affiliateData.regimen,
                            status: affiliateData.status
                        },
                        payload_input: request || {
                            CodigoFarmacia: pharmacy.principal_code || pharmacy.code,
                            CodigoSucursal: pharmacy.type === 'SUCURSAL' ? pharmacy.code : null,
                            ContratoAfiliado: affiliateId,
                            CodigoProgramaPyP: pypCode,
                            AutorizacionExterna: externalAuthId || "UNKNOWN",
                            Medicamentos: medications
                        },
                        payload_output: traceResult || traceError || {}
                    };

                    await traceRepo.save(trace);
                } catch (e) {
                    console.error("Trace error during authorization:", e);
                }
            }
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
