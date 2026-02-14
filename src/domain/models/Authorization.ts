export interface Medication {
    CodigoMedicamento: string;
    Cantidad: number;
    Precio: number;
    Nombre?: string; // Optional for UI display
}

export interface AuthorizationRequest {
    // Code of the pharmacy where the authorization is requested.
    CodigoFarmacia: string;
    CodigoSucursal?: string | null;
    ContratoAfiliado: string;
    // Code of the Prevention and Promotion Program.
    CodigoProgramaPyP: number;
    AutorizacionExterna: string;
    Medicamentos: Medication[];
}

export interface AuthorizationResponse {
    ErrorNumber: number;
    ErrorMessage: string;
    NumeroAutorizacion?: string;
    // Add other fields from the response as needed
}
