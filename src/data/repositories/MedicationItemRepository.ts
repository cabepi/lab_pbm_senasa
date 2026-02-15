import type { MedicationItem } from "../../domain/models/MedicationItem";
import type { HttpClient } from "../../domain/repositories/HttpClient";
import { FetchHttpClient } from "../infrastructure/FetchHttpClient";

export class MedicationItemRepository {
    private http: HttpClient;
    private baseUrl: string;

    constructor() {
        this.http = new FetchHttpClient();
        const envUrl = import.meta.env.VITE_API_BASE_URL;
        this.baseUrl = envUrl
            ? (envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`)
            : '/api';
    }

    async search(query: string): Promise<MedicationItem[]> {
        if (!query) return [];
        return this.http.get<MedicationItem[]>(`${this.baseUrl}/medications/search?q=${encodeURIComponent(query)}`);
    }
}
