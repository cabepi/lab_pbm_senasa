import React from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusCard } from "../components/ui/StatusCard";
import { DataGrid } from "../components/ui/DataGrid";
import { Badge } from "../components/ui/Badge";
import { Upload, FileText, Eye, Edit2 } from "lucide-react";

// Mock Data Type to match the image
interface Process {
    id: string;
    type: "FARMACIA" | "ALMUERZO";
    period: string;
    file: string;
    uploadDate: string;
    records: number;
    total: string;
    status: "ACEPTADO" | "PENDIENTE";
}

const mockData: Process[] = [
    {
        id: "#18",
        type: "FARMACIA",
        period: "01-2026",
        file: "Balances de Consumos- Farmacia (12).xls",
        uploadDate: "13/02/2026 16:14",
        records: 66,
        total: "RD$248,582.67",
        status: "ACEPTADO",
    },
    {
        id: "#17",
        type: "ALMUERZO",
        period: "01-2026",
        file: "Balances de Consumos Comida Empresarial (12).xls",
        uploadDate: "13/02/2026 16:14",
        records: 125,
        total: "RD$448,842.00",
        status: "ACEPTADO",
    },
];

export const ProcesosPage: React.FC = () => {
    const columns = [
        { header: "ID", accessor: "id" as keyof Process, className: "w-16" },
        {
            header: "Tipo",
            accessor: (item: Process) => (
                <Badge variant={item.type === 'FARMACIA' ? 'purple' : 'info'}>{item.type}</Badge>
            )
        },
        { header: "Periodo", accessor: "period" as keyof Process, className: "text-gray-500" },
        {
            header: "Archivo",
            accessor: (item: Process) => (
                <div className="flex items-center gap-2 text-gray-700">
                    <FileText size={16} className="text-green-600" />
                    <span>{item.file}</span>
                </div>
            )
        },
        { header: "Fecha Carga", accessor: "uploadDate" as keyof Process, className: "text-gray-500" },
        { header: "Registros", accessor: "records" as keyof Process, className: "text-center" },
        { header: "Total", accessor: "total" as keyof Process, className: "font-bold text-gray-900" },
        {
            header: "Estado",
            accessor: (item: Process) => (
                <Badge variant="success">{item.status}</Badge>
            )
        },
        {
            header: "Acciones",
            accessor: () => (
                <div className="flex items-center gap-3 text-gray-400">
                    <button className="hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                    <button className="hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <PageHeader
                title="Procesos"
                subtitle="Gestión de Cargas de Almuerzo y Farmacia"
                action={{
                    label: "Cargar Archivo",
                    icon: <Upload size={16} />,
                    onClick: () => console.log("Upload")
                }}
            />

            <StatusCard
                period="01-2026"
                badges={[
                    { label: "Almuerzo", color: "green" },
                    { label: "Farmacia", color: "purple" }
                ]}
                action={{
                    label: "Generar Archivo EDD",
                    onClick: () => console.log("Generate")
                }}
            />

            <DataGrid<Process>
                data={mockData}
                columns={columns}
                keyExtractor={(item) => item.id}
            />
        </div>
    );
};
