import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import type { AuthorizationResponse } from '../../../domain/models/Authorization';
import { ShieldCheck, AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface AuthorizationSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthorize: () => void;
    validationResponse: AuthorizationResponse | null;
    isAuthorizing: boolean;
}

export const AuthorizationSummaryModal: React.FC<AuthorizationSummaryModalProps> = ({
    isOpen,
    onClose,
    onAuthorize,
    validationResponse,
    isAuthorizing
}) => {
    if (!validationResponse || !validationResponse.detalle) return null;

    const { detalle } = validationResponse;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-blue-700">
                        <ShieldCheck className="w-6 h-6" />
                        Resumen de Validación
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-green-800">Validación Exitosa</h3>
                            <p className="text-sm text-green-700 mt-1">
                                {validationResponse.respuesta?.mensaje || validationResponse.ErrorMessage}
                            </p>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Total Factura</p>
                            <p className="text-2xl font-bold text-gray-900">${detalle.TotalFactura.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Monto Autorizado</p>
                            <p className="text-2xl font-bold text-gray-900">${detalle.MontoAutorizado.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">Copago Afiliado</p>
                            <p className="text-2xl font-bold text-gray-900">${detalle.MontoCopago.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-200">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cobertura Básico:</span>
                            <span className="font-medium">${detalle.CoberturaBasico.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cobertura Plan:</span>
                            <span className="font-medium">${detalle.CoberturaPlan.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Medications Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Facturado</th>
                                    <th className="px-4 py-3 text-right">Autorizado</th>
                                    <th className="px-4 py-3 text-right">Copago</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {detalle.medicamentos.map((med, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-gray-600">{med.Codigo}</td>
                                        <td className="px-4 py-3">
                                            {med.CodError === 1 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                    <CheckCircle size={12} />
                                                    En Cobertura
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200" title={med.Mensaje}>
                                                    <AlertCircle size={12} />
                                                    No Cubierto
                                                </span>
                                            )}
                                            {med.CodError !== 1 && (
                                                <p className="text-xs text-red-600 mt-1">{med.Mensaje}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">${med.TotalFactura.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">${med.MontoAutorizado.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">${med.MontoCopago.toFixed(2)}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="secondary" onClick={onClose} disabled={isAuthorizing}>
                        Cancelar
                    </Button>
                    <Button onClick={onAuthorize} isLoading={isAuthorizing} icon={<FileText size={18} />}>
                        Confirmar Autorización
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
