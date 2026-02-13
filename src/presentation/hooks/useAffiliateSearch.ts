import { useState } from "react";
import { UnipagoAffiliateRepository } from "../../data/repositories/UnipagoAffiliateRepository";
import { UnipagoAuthRepository } from "../../data/repositories/UnipagoAuthRepository";
import { FetchHttpClient } from "../../data/infrastructure/FetchHttpClient";
import type { Affiliate } from "../../domain/models/Affiliate";

export const useAffiliateSearch = () => {
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchAffiliate = async (cedula: string) => {
        setIsLoading(true);
        setError(null);
        setAffiliate(null);

        try {
            // Initialize repositories (In a real app, use DI)
            const httpClient = new FetchHttpClient("/unipago"); // Use proxy prefix
            const authRepo = new UnipagoAuthRepository(httpClient, ""); // Auth is at /unipago/Autenticar
            const affiliateRepo = new UnipagoAffiliateRepository(httpClient, authRepo, ""); // API is relative to proxy

            // The repositories use baseUrl + endpoint. 
            // Proxy maps /unipago -> http://186.148.93.132/MedicamentosUnipago
            // Auth: /unipago/Autenticar -> http://.../Autenticar
            // Search: /unipago/api/Afiliado/Consultar -> http://.../api/Afiliado/Consultar

            const result = await affiliateRepo.findByCedula(cedula);

            if (result) {
                setAffiliate(result);
            } else {
                setError("Afiliado no encontrado.");
            }
        } catch (err) {
            setError("Error al buscar el afiliado.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return { affiliate, isLoading, error, searchAffiliate };
};
