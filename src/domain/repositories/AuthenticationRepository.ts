export interface AuthenticationRepository {
    authenticate(): Promise<string>;
}
