import type { Affiliate } from "../models/Affiliate";

export interface AffiliateRepository {
    findByDocument(documentNumber: string, documentType: number): Promise<Affiliate | null>;
}
