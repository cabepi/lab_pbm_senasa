export interface PlanMedicamento {
    IdPlan: number;
    NombrePlan: string;
    IdTipoPlan: number;
    TipoPlan: string;
    TipoPoliza: string;
    MontoTope: number;
    Disponible: number;
    Copago: number;
    IdPoliza: number;
    Poliza: string | null;
    FechaRenovacion: string;
}

export interface ProgramaPyP {
    CodigoPrograma: number;
    Programa: string;
    CodigoCirculo: number;
    Circulo: string;
}

export interface Affiliate {
    CodigoAfiliado: number;
    Nombres: string;
    Apellidos: string;
    Cedula: string;
    Nss: string;
    Sexo: string;
    FechaNacimiento: string;
    Estado: number;
    EstadoDesc: string;
    Regimen: string;
    ListaPlanesMedicamentos: PlanMedicamento[];
    ListaProgramaPyP: ProgramaPyP[];
    Telefono: string;
    Celular: string;
    CodPersona: number;
    CodParentesco: string;
    CodFamilia: number;
    ErrorNumber: number;
    ErrorMessage: string;
}
