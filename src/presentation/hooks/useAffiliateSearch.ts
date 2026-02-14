import { useState } from "react";
import { UnipagoAffiliateRepository } from "../../data/repositories/UnipagoAffiliateRepository";
import { UnipagoAuthRepository } from "../../data/repositories/UnipagoAuthRepository";
import { FetchHttpClient } from "../../data/infrastructure/FetchHttpClient";
import type { Affiliate } from "../../domain/models/Affiliate";

export const useAffiliateSearch = () => {
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const searchAffiliate = async (cedula: string) => {
        setIsLoading(true);
        setError(null);
        setWarning(null);
        setAffiliate(null);

        try {
            // Initialize repositories (In a real app, use DI)
            const httpClient = new FetchHttpClient("/unipago");
            const authRepo = new UnipagoAuthRepository(httpClient, "");
            const affiliateRepo = new UnipagoAffiliateRepository(httpClient, authRepo, "");

            const result = await affiliateRepo.findByCedula(cedula);

            if (result) {
                // Check for specific API error/warning structure
                // ErrorNumber 1000 indicates success
                if (result.ErrorNumber === 1000) {
                    setAffiliate(result);
                } else {
                    // Any other ErrorNumber indicates a problem/warning
                    setWarning(result.ErrorMessage || "Advertencia desconocida del servicio.");
                    setAffiliate(null); // Ensure no affiliate data is shown if there's a warning/error
                }
            } else {
                // Should likely not be reached if repo throws, but just in case
                setError("No se pudo obtener respuesta del servicio.");
            }
        } catch (err: any) {
            console.error(err);
            const message = err.message || "";
            if (message.includes("500")) {
                setError("Ha ocurrido un error inesperado. Por favor intente más tarde.");
            } else {
                setError(`Error al buscar el afiliado: ${message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { affiliate, isLoading, error, warning, searchAffiliate };
};
