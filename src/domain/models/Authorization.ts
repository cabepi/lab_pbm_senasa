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

export interface AuthorizationMedicationDetail {
    CodError: number;
    Mensaje: string;
    Codigo: number | string;
    TotalFactura: number;
    CoberturaBasico: number;
    CoberturaPlan: number;
    MontoAutorizado: number;
    MontoCopago: number;
}

export interface AuthorizationDetail {
    CodigoAutorizacion?: number | string;
    CoberturaBasico: number;
    CoberturaPlan: number;
    MontoAutorizado: number;
    MontoCopago: number;
    TotalFactura: number;
    medicamentos: AuthorizationMedicationDetail[];
}

export interface AuthorizationResponse {
    ErrorNumber: number;
    ErrorMessage: string;
    NumeroAutorizacion?: string;
    // Structure returned by API
    respuesta?: {
        codigo: number;
        mensaje: string;
    };
    detalle?: AuthorizationDetail;
}
