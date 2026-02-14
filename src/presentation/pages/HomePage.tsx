import React, { useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Collapsible } from "../components/ui/Collapsible";
import { PlanList } from "../components/affiliate/PlanList";
import { ProgramList } from "../components/affiliate/ProgramList";
import { Search, Phone, Smartphone, AlertCircle, CheckCircle } from "lucide-react";
import { useAffiliateSearch } from "../hooks/useAffiliateSearch";
import { Badge } from "../components/ui/Badge";
import { AuthorizationPanel } from "../components/authorization/AuthorizationPanel";
import { AuthorizationSummaryModal } from "../components/authorization/AuthorizationSummaryModal";
import { useAuthorization } from "../hooks/useAuthorization";
import type { Medication } from "../../domain/models/Authorization";
import type { Pharmacy } from "../../domain/models/Pharmacy";

export const HomePage: React.FC = () => {
    const [cedula, setCedula] = useState("");
    const { affiliate, isLoading, error, warning, searchAffiliate } = useAffiliateSearch();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<{
        medications: Medication[];
        pharmacy: Pharmacy;
        pypCode: number;
        transactionId: string;
    } | null>(null);

    const {
        isLoading: isAuthLoading,
        isAuthorizing,
        error: authError,
        response: authResponse,
        authorizedResponse,
        validateAuthorization,
        authorize,
        resetState
    } = useAuthorization();

    // Effect to open modal when validation is successful (1000)
    React.useEffect(() => {
        if (authResponse && authResponse.ErrorNumber === 1000 && !authorizedResponse) {
            setIsAuthModalOpen(true);
        }
    }, [authResponse, authorizedResponse]);

    // Effect to close modal and show success when authorization is successful
    React.useEffect(() => {
        if (authorizedResponse && authorizedResponse.ErrorNumber === 1000) {
            setIsAuthModalOpen(false);
        }
    }, [authorizedResponse]);

    const [isAuthStarted, setIsAuthStarted] = useState(false);

    const handleValidate = (medications: Medication[], pharmacy: Pharmacy, pypCode: number) => {
        if (!affiliate) return;
        const transactionId = crypto.randomUUID(); // Generate unique transaction ID
        setCurrentTransaction({ medications, pharmacy, pypCode, transactionId });

        const affiliateSnapshot = {
            document: affiliate.Cedula,
            nss: affiliate.Nss,
            first_name: affiliate.Nombres,
            last_name: affiliate.Apellidos,
            regimen: affiliate.Regimen,
            status: affiliate.EstadoDesc
        };

        validateAuthorization(affiliate.CodigoAfiliado.toString(), pharmacy, medications, pypCode, transactionId, affiliateSnapshot);
    };

    const handleAuthorize = () => {
        if (!affiliate || !currentTransaction) return;

        const affiliateSnapshot = {
            document: affiliate.Cedula,
            nss: affiliate.Nss,
            first_name: affiliate.Nombres,
            last_name: affiliate.Apellidos,
            regimen: affiliate.Regimen,
            status: affiliate.EstadoDesc
        };

        authorize(
            affiliate.CodigoAfiliado.toString(),
            currentTransaction.pharmacy,
            currentTransaction.medications,
            currentTransaction.pypCode,
            currentTransaction.transactionId,
            undefined, // externalAuthId (optional)
            affiliateSnapshot
        );
    };

    const handleCloseModal = () => {
        setIsAuthModalOpen(false);
        // Optional: clear auth response if needed to reset flow
    };

    const handleStartAuthorization = () => {
        setIsAuthStarted(true);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (cedula.trim()) {
            searchAffiliate(cedula.trim());
            setIsAuthStarted(false); // Reset auth state on new search
        }
    };

    const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        // Apply mask: 000-0000000-0
        if (value.length > 3 && value.length <= 10) {
            value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 10) {
            value = `${value.slice(0, 3)}-${value.slice(3, 10)}-${value.slice(10)}`;
        }

        setCedula(value);
    };

    // Render Success Screen if Authorized
    if (authorizedResponse && authorizedResponse.ErrorNumber === 1000 && authorizedResponse.detalle) {
        return (
            <div className="max-w-4xl mx-auto pt-10 px-4">
                <Card className="p-8 text-center space-y-6 border-t-4 border-t-green-500 shadow-xl">
                    <div className="flex justify-center">
                        <div className="bg-green-100 p-4 rounded-full text-green-600">
                            <CheckCircle size={48} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">¡Autorización Exitosa!</h1>
                    <p className="text-gray-600 text-lg">La transacción ha sido procesada correctamente.</p>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 inline-block text-left min-w-[300px] space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Número de Autorización</p>
                            <p className="text-4xl font-mono font-bold text-gray-900 tracking-tight">
                                {authorizedResponse.detalle.CodigoAutorizacion}
                            </p>
                        </div>
                        <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Total Factura</p>
                                <p className="font-semibold">${authorizedResponse.detalle.TotalFactura.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Monto Autorizado</p>
                                <p className="font-semibold text-gray-900">${authorizedResponse.detalle.MontoAutorizado.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button onClick={() => window.location.reload()} variant="secondary">
                            Nueva Consulta
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
            {/* ... (existing header and search) ... */}
            <PageHeader title="Búsqueda de Afiliados" subtitle="Ingrese la cédula del afiliado para consultar su información en Unipago." />

            {/* Authorization Summary Modal */}
            <AuthorizationSummaryModal
                isOpen={isAuthModalOpen}
                onClose={handleCloseModal}
                onAuthorize={handleAuthorize}
                validationResponse={authResponse}
                isAuthorizing={isAuthorizing}
            />

            <div className="max-w-4xl mx-auto">
                <Card className="p-6 shadow-md border-t-4 border-t-senasa-secondary">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        {/* ... (existing form content) ... */}
                        <div className="flex-1 w-full">
                            <Input
                                label="Cédula"
                                placeholder="000-0000000-0"
                                value={cedula}
                                onChange={handleCedulaChange}
                                icon={<Search size={18} />}
                                required
                                maxLength={13}
                                className="py-1"
                            />
                        </div>
                        <Button type="submit" isLoading={isLoading} disabled={!cedula.trim()} size="sm" className="h-[34px]">
                            Buscar Afiliado
                        </Button>
                    </form>
                </Card>
            </div>

            {/* ... (existing warnings and errors) ... */}
            {warning && (
                <div className="max-w-4xl mx-auto p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span className="font-medium">Atención:</span>
                    <span>{warning}</span>
                </div>
            )}

            {error && (
                <div className="max-w-4xl mx-auto p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span className="font-medium">Error:</span>
                    <span>{error}</span>
                </div>
            )}

            {affiliate && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* ... (existing affiliate details) ... */}
                    {/* Header Status */}
                    <div className="max-w-4xl mx-auto">
                        <div className={`p-4 rounded-lg flex items-center justify-between shadow-sm border ${affiliate.Estado === 3 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                            <div className="flex items-center gap-2 font-medium">
                                {affiliate.Estado === 3 ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <span>{affiliate.EstadoDesc}</span>
                            </div>
                            <div className="text-sm opacity-75">
                                Código: {affiliate.CodigoAfiliado}
                            </div>
                        </div>
                    </div>

                    {/* Grid Layout: Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Collapsible title="Información Personal" defaultOpen={true}>
                            <dl className="grid grid-cols-1 gap-y-4 text-sm mt-2">
                                <div>
                                    <dt className="text-gray-500">Nombre Completo</dt>
                                    <dd className="font-medium text-gray-900 text-lg">{affiliate.Nombres} {affiliate.Apellidos}</dd>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-gray-500">Cédula</dt>
                                        <dd className="font-medium text-gray-900">{affiliate.Cedula}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">NSS</dt>
                                        <dd className="font-medium text-gray-900">{affiliate.Nss}</dd>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-gray-500">Fecha de Nacimiento</dt>
                                        <dd className="font-medium text-gray-900">{new Date(affiliate.FechaNacimiento).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Sexo</dt>
                                        <dd className="font-medium text-gray-900">{affiliate.Sexo}</dd>
                                    </div>
                                </div>
                            </dl>
                        </Collapsible>

                        <Collapsible title="Contacto y Régimen" defaultOpen={true}>
                            <dl className="grid grid-cols-1 gap-y-4 text-sm mt-2">
                                <div>
                                    <dt className="text-gray-500">Régimen</dt>
                                    <dd className="mt-1">
                                        <Badge variant="purple" className="text-sm px-3 py-1">{affiliate.Regimen}</Badge>
                                    </dd>
                                </div>
                                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                    <Phone size={18} className="text-gray-400" />
                                    <div>
                                        <dt className="text-xs text-gray-500">Teléfono</dt>
                                        <dd className="font-medium text-gray-900">{affiliate.Telefono || 'N/A'}</dd>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 py-2">
                                    <Smartphone size={18} className="text-gray-400" />
                                    <div>
                                        <dt className="text-xs text-gray-500">Celular</dt>
                                        <dd className="font-medium text-gray-900">{affiliate.Celular || 'N/A'}</dd>
                                    </div>
                                </div>
                            </dl>
                        </Collapsible>
                    </div>

                    {/* Grid Layout: Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Collapsible title="Planes de Medicamentos" badgeCount={affiliate.ListaPlanesMedicamentos?.length} defaultOpen={true}>
                            <PlanList plans={affiliate.ListaPlanesMedicamentos} />
                        </Collapsible>

                        <Collapsible title="Programas PyP" badgeCount={affiliate.ListaProgramaPyP?.length} defaultOpen={true}>
                            <ProgramList programs={affiliate.ListaProgramaPyP} />
                        </Collapsible>
                    </div>

                    {!isAuthStarted && (
                        <div className="flex justify-center pt-8 pb-4">
                            <Button size="lg" onClick={handleStartAuthorization} className="px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                                Validar Cobertura
                            </Button>
                        </div>
                    )}

                    {isAuthStarted && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AuthorizationPanel
                                onValidate={handleValidate}
                                isLoading={isAuthLoading}
                                error={authError}
                                response={authResponse}
                                affiliateId={affiliate.CodigoAfiliado.toString()}
                                onCloseMessage={resetState}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
