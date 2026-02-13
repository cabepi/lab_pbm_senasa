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

    async findByCedula(cedula: string): Promise<Affiliate | null> {
        try {
            const token = await this.authRepo.authenticate();
            const response = await this.http.get<Affiliate>(
                `${this.baseUrl}/api/Afiliado/Consultar`,
                {
                    TipoDocumento: 1,
                    NoDocumento: cedula,
                },
                {
                    Authorization: `Bearer ${token}`,
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching affiliate:", error);
            return null;
        }
    }
}
