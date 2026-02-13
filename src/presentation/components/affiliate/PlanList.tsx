import React from "react";
import type { PlanMedicamento } from "../../../domain/models/Affiliate";
import { Badge } from "../ui/Badge";

interface PlanListProps {
    plans: PlanMedicamento[];
}

export const PlanList: React.FC<PlanListProps> = ({ plans }) => {
    if (!plans || plans.length === 0) return <p className="text-sm text-gray-500">No hay planes disponibles.</p>;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);
    };

    return (
        <div className="grid gap-4">
            {plans.map((plan) => {
                const percentage = Math.min(100, Math.max(0, (plan.Disponible / plan.MontoTope) * 100));

                return (
                    <div key={plan.IdPlan} className="p-4 border border-gray-100 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-800">{plan.NombrePlan}</h4>
                                <span className="text-xs text-gray-500">{plan.TipoPlan} - {plan.TipoPoliza}</span>
                            </div>
                            <Badge variant="info">{plan.TipoPoliza}</Badge>
                        </div>

                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Disponible: <span className="font-bold text-green-600">{formatCurrency(plan.Disponible)}</span></span>
                                <span className="text-gray-400">Tope: {formatCurrency(plan.MontoTope)}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${percentage < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                                <div>Copago: {(plan.Copago * 100).toFixed(0)}%</div>
                                <div className="text-right">Renovación: {new Date(plan.FechaRenovacion).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
