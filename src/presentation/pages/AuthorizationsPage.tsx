
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileText, ChevronDown, ChevronUp, Search, RefreshCw, User, Clock, Ban } from 'lucide-react';
import type { AuthorizationMedicationDetail } from '../../domain/models/Authorization';
import { VoidAuthorizationModal } from '../components/authorization/VoidAuthorizationModal';
import { useAuth } from '../../context/AuthContext';

interface AuthorizationRecord {
    authorization_code: string;
    transaction_id: string;
    created_at: string;
    pharmacy_code: string;
    pharmacy_name: string;
    affiliate_document: string;
    affiliate_name: string;
    total_amount: number;
    regulated_copay: number;
    authorized_amount: number;
    detail_json: any;
    status: 'AUTHORIZED' | 'VOIDED';
    authorizer_email: string;
    voider_email: string | null;
    voided_at: string | null;
}

export const AuthorizationsPage: React.FC = () => {
    const { user } = useAuth();
    const [authorizations, setAuthorizations] = useState<AuthorizationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Void modal state
    const [voidModal, setVoidModal] = useState<{ isOpen: boolean; authCode: string; pharmacyCode: string }>({
        isOpen: false,
        authCode: '',
        pharmacyCode: '',
    });

    const fetchAuthorizations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/authorizations');
            if (response.ok) {
                const data = await response.json();
                setAuthorizations(data);
            } else {
                console.error('Failed to fetch authorizations');
            }
        } catch (error) {
            console.error('Error fetching authorizations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthorizations();
    }, []);

    const toggleRow = (code: string) => {
        setExpandedRow(expandedRow === code ? null : code);
    };

    const filteredAuths = authorizations.filter(auth =>
        auth.authorization_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.affiliate_document.includes(searchTerm) ||
        auth.affiliate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.authorizer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-DO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openVoidModal = (e: React.MouseEvent, authCode: string, pharmacyCode: string) => {
        e.stopPropagation(); // Prevent row toggle
        setVoidModal({ isOpen: true, authCode, pharmacyCode });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Historial de Autorizaciones"
                subtitle="Consulta el registro de todas las autorizaciones realizadas. Haz clic en un registro para ver los detalles."
            />

            <Card className="p-6 shadow-md border-t-4 border-t-senasa-secondary">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por código, cédula, nombre o farmacia..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-senasa-primary focus:border-senasa-primary sm:text-sm transition duration-150 ease-in-out"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                            {filteredAuths.length} registro{filteredAuths.length !== 1 ? 's' : ''}
                        </span>
                        <Button variant="secondary" onClick={fetchAuthorizations} isLoading={isLoading} icon={<RefreshCw size={16} />}>
                            Actualizar
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Acciones</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afiliado</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmacia</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Autorizado</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && authorizations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw size={16} className="animate-spin" />
                                            Cargando autorizaciones...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAuths.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron autorizaciones.
                                    </td>
                                </tr>
                            ) : (
                                filteredAuths.map((auth) => (
                                    <React.Fragment key={auth.authorization_code}>
                                        <tr
                                            className={`cursor-pointer transition-colors ${expandedRow === auth.authorization_code ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            onClick={() => toggleRow(auth.authorization_code)}
                                        >
                                            {/* Actions column */}
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                {auth.status === 'AUTHORIZED' && (
                                                    <button
                                                        onClick={(e) => openVoidModal(e, auth.authorization_code, auth.pharmacy_code)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-200 transition-colors"
                                                        title="Anular autorización"
                                                    >
                                                        <Ban size={13} />
                                                        Anular
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge
                                                    variant={auth.status === 'AUTHORIZED' ? 'success' : 'error'}
                                                    className="text-xs"
                                                >
                                                    {auth.status === 'AUTHORIZED' ? 'Autorizada' : 'Anulada'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                                                {auth.authorization_code}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(auth.created_at)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                <div className="font-medium">{auth.affiliate_name}</div>
                                                <div className="text-xs text-gray-500">{auth.affiliate_document}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                <div className="max-w-xs truncate" title={auth.pharmacy_name}>{auth.pharmacy_name}</div>
                                                <div className="text-xs text-gray-400 font-mono">{auth.pharmacy_code}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                                {formatCurrency(Number(auth.authorized_amount))}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className="text-gray-400">
                                                    {expandedRow === auth.authorization_code ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </span>
                                            </td>
                                        </tr>

                                        {/* Expandable Detail Row */}
                                        {expandedRow === auth.authorization_code && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={8} className="px-4 py-4">
                                                    <div className="rounded-lg bg-white border border-gray-200 p-5 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-2">
                                                        {/* Header */}
                                                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <FileText size={16} className="text-senasa-primary" />
                                                            Detalle de Autorización
                                                        </h4>

                                                        {/* Financial Summary */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                <span className="block text-xs text-gray-500 uppercase mb-1">Total Factura</span>
                                                                <span className="block text-lg font-semibold text-gray-900">{formatCurrency(Number(auth.total_amount))}</span>
                                                            </div>
                                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                <span className="block text-xs text-gray-500 uppercase mb-1">Copago Regulado</span>
                                                                <span className="block text-lg font-semibold text-gray-900">{formatCurrency(Number(auth.regulated_copay))}</span>
                                                            </div>
                                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                <span className="block text-xs text-gray-500 uppercase mb-1">Monto Autorizado</span>
                                                                <span className="block text-lg font-semibold text-gray-900">{formatCurrency(Number(auth.authorized_amount))}</span>
                                                            </div>
                                                        </div>

                                                        {/* Medications Table */}
                                                        {auth.detail_json?.detalle?.medicamentos && (
                                                            <div>
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Medicamentos</h5>
                                                                <div className="overflow-hidden border border-gray-200 rounded-lg">
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Estado</th>
                                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Facturado</th>
                                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Autorizado</th>
                                                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Copago</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {auth.detail_json.detalle.medicamentos.map((med: AuthorizationMedicationDetail, idx: number) => (
                                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{med.Codigo}</td>
                                                                                    <td className="px-4 py-2 text-sm">
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                                            {med.Mensaje}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(med.TotalFactura)}</td>
                                                                                    <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(med.MontoAutorizado)}</td>
                                                                                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(med.MontoCopago)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Metadata footer */}
                                                        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <User size={13} />
                                                                <span>Autorizador: <span className="font-medium text-gray-700">{auth.authorizer_email}</span></span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={13} />
                                                                <span>Transaction ID: <span className="font-mono text-gray-700">{auth.transaction_id}</span></span>
                                                            </div>
                                                            {auth.status === 'VOIDED' && auth.voider_email && (
                                                                <>
                                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                                        <User size={13} />
                                                                        <span>Anulador: <span className="font-medium">{auth.voider_email}</span></span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                                        <Clock size={13} />
                                                                        <span>Fecha Anulación: <span className="font-medium">{auth.voided_at ? formatDate(auth.voided_at) : 'N/A'}</span></span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Void Authorization Modal */}
            <VoidAuthorizationModal
                isOpen={voidModal.isOpen}
                onClose={() => setVoidModal({ isOpen: false, authCode: '', pharmacyCode: '' })}
                authorizationCode={voidModal.authCode}
                pharmacyCode={voidModal.pharmacyCode}
                voiderEmail={user?.email || 'unknown'}
                onVoidSuccess={fetchAuthorizations}
            />
        </div>
    );
};
