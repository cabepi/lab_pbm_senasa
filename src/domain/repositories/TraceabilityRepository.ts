import type { TransactionTrace } from "../models/Traceability";

export interface TraceabilityRepository {
    save(trace: TransactionTrace): Promise<void>;
}
