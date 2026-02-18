import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Trash2, Package, ShieldCheck, AlertCircle, CheckCircle, X } from "lucide-react";
import { MedicationForm } from "./MedicationForm";
import type { Medication } from "../../../domain/models/Authorization";
import type { Pharmacy } from "../../../domain/models/Pharmacy";

interface AuthorizationPanelProps {
    onValidate: (medications: Medication[], pharmacy: Pharmacy) => void;
    isLoading: boolean;
    error: string | null;
    response: any | null;
    affiliateId: string;
    onCloseMessage?: () => void;
    selectedPharmacy: Pharmacy | null;
    pypCode: number;
}

export const AuthorizationPanel: React.FC<AuthorizationPanelProps> = ({
    onValidate,
    isLoading,
    error,
    response,
    affiliateId,
    onCloseMessage,
    selectedPharmacy,
    pypCode
}) => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [showTooltip, setShowTooltip] = useState(false);

    // Calculate total amount
    const totalAmount = medications.reduce((sum, med) => sum + (med.Cantidad * med.Precio), 0);

    const handleAddMedication = (medication: Medication) => {
        setMedications(prev => [...prev, medication]);
    };

    const handleRemoveMedication = (index: number) => {
        setMedications(prev => prev.filter((_, i) => i !== index));
    };

    // Reset when pharmacy changes? Or keep meds?
    // For now, let's keep them unless user navigates away.

    const getPayloadPreview = () => {
        if (!selectedPharmacy) return null;

        let codigoFarmacia = selectedPharmacy.code;
        let codigoSucursal: string | null = null;

        if (selectedPharmacy.type === 'SUCURSAL' && selectedPharmacy.principal_code) {
            codigoFarmacia = selectedPharmacy.principal_code;
            codigoSucursal = selectedPharmacy.code;
        }

        return {
            codigoFarmacia,
            codigoSucursal,
            pypCode,
            numRef: Math.floor(Math.random() * 1000000)
        };
    };

    const previewData = getPayloadPreview();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Validar Autorización</h2>

            {/* Medications (only shown after pharmacy selection) */}
            {selectedPharmacy ? (
                <div className="space-y-5">
                    {/* Medication Form - Full Width */}
                    <MedicationForm onAdd={handleAddMedication} />

                    {/* Medication Table */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-gray-500" />
                                <h3 className="text-sm font-semibold text-gray-700">Medicamentos a Validar</h3>
                                {medications.length > 0 && (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {medications.length}
                                    </span>
                                )}
                            </div>
                            {medications.length > 0 && (
                                <span className="text-sm font-semibold text-gray-600">
                                    Total: <span className="text-blue-700">${totalAmount.toFixed(2)}</span>
                                </span>
                            )}
                        </div>

                        {medications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Package size={40} className="mb-3 opacity-40" />
                                <p className="text-sm font-medium">No hay medicamentos agregados</p>
                                <p className="text-xs mt-1">Utilice el formulario de arriba para agregar medicamentos</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {medications.map((med, index) => (
                                            <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="px-5 py-3 text-sm text-gray-400 font-mono">{index + 1}</td>
                                                <td className="px-5 py-3">
                                                    <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md font-mono flex items-center gap-2 w-fit">
                                                        {med.CodigoMedicamento}
                                                        {!med.Nombre && (
                                                            <div className="group relative">
                                                                <AlertCircle size={14} className="text-yellow-500" />
                                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    No catalogado
                                                                </span>
                                                            </div>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-sm text-gray-600">
                                                    {med.Nombre || ''}
                                                </td>
                                                <td className="px-5 py-3 text-center text-sm text-gray-700 font-medium">{med.Cantidad}</td>
                                                <td className="px-5 py-3 text-right text-sm text-gray-700">${med.Precio.toFixed(2)}</td>
                                                <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">${(med.Cantidad * med.Precio).toFixed(2)}</td>
                                                <td className="px-5 py-3 text-center">
                                                    <button
                                                        onClick={() => handleRemoveMedication(index)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all duration-200"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                            <td colSpan={4} className="px-5 py-3 text-right text-sm font-bold text-gray-600 uppercase">Total General</td>
                                            <td className="px-5 py-3 text-right text-base font-bold text-blue-700">${totalAmount.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {/* Validate Button Area */}
                        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex items-center justify-between relative rounded-b-xl">

                            {/* PyP Code Display (Read Only) */}
                            <div className="flex items-center gap-3">
                                {pypCode > 0 ? (
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-700">
                                        <span className="text-xs font-semibold uppercase tracking-wider">Programa PyP:</span>
                                        <span className="font-mono font-bold">{pypCode}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 opacity-70">
                                        <span className="text-xs font-medium uppercase tracking-wider">Sin PyP</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center relative">
                                {showTooltip && medications.length > 0 && selectedPharmacy && previewData && (
                                    <div className="absolute bottom-full right-0 mb-3 w-[450px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 ring-1 ring-black/10">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center rounded-t-xl">
                                            <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                                                <ShieldCheck size={16} className="text-blue-600" />
                                                Resumen de Envío
                                            </h3>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Payload Preview</span>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {/* Key Value Grid */}
                                            <div className="grid grid-cols-12 gap-y-2 gap-x-4 text-xs">
                                                <div className="col-span-4 text-gray-500 font-medium text-right">Farmacia:</div>
                                                <div className="col-span-8 text-gray-900 font-medium truncate">
                                                    {selectedPharmacy.name}
                                                    <span className="text-gray-400 font-normal ml-1">
                                                        ({previewData.codigoFarmacia} {previewData.codigoSucursal ? ` / Suc: ${previewData.codigoSucursal}` : ''})
                                                    </span>
                                                </div>

                                                <div className="col-span-4 text-gray-500 font-medium text-right">Código Farmacia:</div>
                                                <div className="col-span-8 text-gray-900 font-mono bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100">
                                                    {previewData.codigoFarmacia}
                                                </div>

                                                <div className="col-span-4 text-gray-500 font-medium text-right">Código Sucursal:</div>
                                                <div className="col-span-8 text-gray-900 font-mono bg-purple-50 px-1.5 py-0.5 rounded w-fit border border-purple-100">
                                                    {previewData.codigoSucursal || <span className="text-gray-400 italic">N/A (Principal)</span>}
                                                </div>

                                                <div className="col-span-4 text-gray-500 font-medium text-right">Afiliado:</div>
                                                <div className="col-span-8 text-gray-900 font-mono bg-gray-50 px-1.5 py-0.5 rounded w-fit border border-gray-100">
                                                    {affiliateId}
                                                </div>

                                                <div className="col-span-4 text-gray-500 font-medium text-right">Código PyP:</div>
                                                <div className="col-span-8 text-gray-900 font-mono bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100">
                                                    {previewData.pypCode}
                                                </div>

                                                <div className="col-span-4 text-gray-500 font-medium text-right">ID Ref. Externa:</div>
                                                <div className="col-span-8 text-gray-600 text-[10px] font-mono break-all leading-tight bg-gray-50 p-1 rounded border border-gray-100">
                                                    {`NUM_REF_FARMACIA_${previewData.codigoFarmacia}_${previewData.numRef}`}
                                                </div>
                                            </div>

                                            {/* Meds Summary Table */}
                                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left">Medicamento</th>
                                                            <th className="px-3 py-2 text-center w-16">Cant.</th>
                                                            <th className="px-3 py-2 text-right w-20">Precio</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {medications.map((m, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/50">
                                                                <td className="px-3 py-1.5 text-gray-700 truncate max-w-[180px]" title={m.Nombre}>
                                                                    <span className="font-medium mr-1">{m.CodigoMedicamento}</span>
                                                                    <span className="text-gray-500 text-[10px]">{m.Nombre}</span>
                                                                </td>
                                                                <td className="px-3 py-1.5 text-center text-gray-600">{m.Cantidad}</td>
                                                                <td className="px-3 py-1.5 text-right text-gray-800 font-medium">${(m.Cantidad * m.Precio).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-gray-50/80 font-semibold text-gray-800">
                                                            <td className="px-3 py-2 text-right">Total</td>
                                                            <td className="px-3 py-2 text-center">{medications.reduce((a, b) => a + b.Cantidad, 0)}</td>
                                                            <td className="px-3 py-2 text-right text-blue-600">${totalAmount.toFixed(2)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute bottom-[-5px] right-8 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 transform"></div>
                                    </div>
                                )}

                                <div
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <Button
                                        onClick={() => onValidate(medications, selectedPharmacy)}
                                        isLoading={isLoading}
                                        disabled={medications.length === 0}
                                        icon={<ShieldCheck size={18} />}
                                    >
                                        Validar Autorización
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    <ShieldCheck size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-gray-500">Seleccione una farmacia</p>
                    <p className="text-sm">Para continuar con la validación de medicamentos</p>
                </div>
            )}

            {/* Error/Success Messages */}
            {error && (
                <div className="relative p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 flex gap-2 items-center">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                    {onCloseMessage && (
                        <button
                            onClick={onCloseMessage}
                            className="ml-2 text-current opacity-70 hover:opacity-100 focus:outline-none"
                            aria-label="Cerrar mensaje"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}

            {
                response && (
                    <div className={`relative p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border ${response.ErrorNumber === 1000
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                        }`}>
                        {response.ErrorNumber === 1000
                            ? <CheckCircle size={24} className="mt-0.5 shrink-0" />
                            : <AlertCircle size={24} className="mt-0.5 shrink-0" />
                        }
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${response.ErrorNumber === 1000
                                    ? 'bg-green-100 border-green-200 text-green-700'
                                    : 'bg-yellow-100 border-yellow-200 text-yellow-700'
                                    }`}>
                                    Código {response.ErrorNumber}
                                </span>
                            </div>

                            <p className="font-bold text-base">
                                {response.ErrorNumber === 1000 ? 'Autorización Exitosa' : 'Error al validar la autorización.'}
                            </p>

                            <div className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">
                                {response.ErrorMessage}
                            </div>

                            {response.NumeroAutorizacion && (
                                <div className="mt-2 pt-2 border-t border-green-200/50">
                                    <p className="text-sm font-medium">No. Autorización: <span className="font-mono text-base">{response.NumeroAutorizacion}</span></p>
                                </div>
                            )}
                        </div>
                        {onCloseMessage && (
                            <button
                                onClick={onCloseMessage}
                                className="ml-2 text-current opacity-70 hover:opacity-100 focus:outline-none"
                                aria-label="Cerrar mensaje"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )
            }
        </div >
    );
};
