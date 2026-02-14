export interface Medication {
    CodigoMedicamento: string;
    Cantidad: number;
    Precio: number;
    Nombre?: string; // Optional for UI display
}

export interface AuthorizationRequest {
    CodigoFarmacia: string;
    ContratoAfiliado: string;
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
