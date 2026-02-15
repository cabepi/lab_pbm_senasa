import type { Pharmacy } from "../../domain/models/Pharmacy";
import type { HttpClient } from "../../domain/repositories/HttpClient";
import { FetchHttpClient } from "../infrastructure/FetchHttpClient";

export class PharmacyRepository {
    private http: HttpClient;
    private baseUrl: string;

    constructor() {
        this.http = new FetchHttpClient();
        this.baseUrl = '/api';
    }

    async search(query: string): Promise<Pharmacy[]> {
        if (!query) return [];
        return this.http.get<Pharmacy[]>(`${this.baseUrl}/pharmacies/search?q=${encodeURIComponent(query)}`);
    }
}
