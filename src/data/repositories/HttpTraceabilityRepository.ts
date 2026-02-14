import type { TraceabilityRepository } from "../../domain/repositories/TraceabilityRepository";
import type { TransactionTrace } from "../../domain/models/Traceability";
import type { HttpClient } from "../../domain/repositories/HttpClient";

export class HttpTraceabilityRepository implements TraceabilityRepository {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    async save(trace: TransactionTrace): Promise<void> {
        try {
            await this.http.post("/api/traces/register", trace);
        } catch (error) {
            console.error("Failed to save transaction trace:", error);
        }
    }
}
