import type { Affiliate } from "../../domain/models/Affiliate";
import type { AffiliateRepository } from "../../domain/repositories/AffiliateRepository";
import type { HttpClient } from "../../domain/repositories/HttpClient";
import type { UnipagoAuthRepository } from "./UnipagoAuthRepository";

export class UnipagoAffiliateRepository implements AffiliateRepository {
    private http: HttpClient;
    private authRepo: UnipagoAuthRepository;
    private baseUrl: string;

    constructor(http: HttpClient, authRepo: UnipagoAuthRepository, baseUrl: string) {
        this.http = http;
        this.authRepo = authRepo;
        this.baseUrl = baseUrl;
    }

    async findByDocument(documentNumber: string, documentType: number): Promise<Affiliate | null> {
        // We let errors bubble up to be handled by the use case/hook
        const token = await this.authRepo.authenticate();

        // Use fetch directly or update HttpClient to support query params object strictly
        // Assuming HttpClient handles the object or we append to URL. 
        // Based on previous code, the second argument to get is body/params? 
        // The FetchHttpClient implementation likely takes (url, headers?) or similar. 
        // Let's look at FetchHttpClient usage in the original file. 
        // Original: this.http.get(url, { TipoDocumento... }, { Authorization... })
        // If the second arg is query params, then we just update the object.

        const response = await this.http.get<Affiliate>(
            `${this.baseUrl}/api/Afiliado/Consultar`,
            {
                TipoDocumento: documentType,
                NoDocumento: documentNumber,
            },
            {
                Authorization: `Bearer ${token}`,
            }
        );
        return response;
    }
}
