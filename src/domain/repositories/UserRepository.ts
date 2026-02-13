import type { Repository } from "./Repository";
import type { User } from "../models/User";

export interface UserRepository extends Repository<User> {
    findByEmail(email: string): Promise<User | null>;
}
