import React from "react";
import type { ProgramaPyP } from "../../../domain/models/Affiliate";
import { Activity } from "lucide-react";

interface ProgramListProps {
    programs: ProgramaPyP[];
}

export const ProgramList: React.FC<ProgramListProps> = ({ programs }) => {
    if (!programs || programs.length === 0) return <p className="text-sm text-gray-500">No hay programas asignados.</p>;

    return (
        <div className="space-y-3">
            {programs.map((program) => (
                <div key={program.CodigoPrograma} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm">
                        <Activity size={16} />
                    </div>
                    <div>
                        <h5 className="font-medium text-gray-900">{program.Programa}</h5>
                        <p className="text-xs text-gray-500">{program.Circulo}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
