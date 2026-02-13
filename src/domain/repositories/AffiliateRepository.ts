import type { Affiliate } from "../models/Affiliate";

export interface AffiliateRepository {
    findByCedula(cedula: string): Promise<Affiliate | null>;
}
