import { useEffect, useState, useMemo } from 'react';
import { TransactionTimeline } from '../components/traceability/TransactionTimeline';
import { RefreshCw, Search, Loader2 } from 'lucide-react';
import { FetchHttpClient } from '../../data/infrastructure/FetchHttpClient';

interface TraceEvent {
    id: string;
    created_at: string;
    transaction_id: string;
    action_type: string;
    response_code: number;
    duration_ms: number;
    user_email: string;
    pharmacy_code: string;
    payload_input: unknown;
    payload_output: unknown;
    authorization_code?: string;
}

export const TraceabilityPage = () => {
    const [traces, setTraces] = useState<TraceEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchTraces = async () => {
        setIsLoading(true);
        try {
            const client = new FetchHttpClient();
            const response = await client.get<TraceEvent[]>('/api/traces');
            setTraces(response);
        } catch (error) {
            console.error('Failed to fetch traces:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTraces();
    }, []);

    // Group traces by transaction_id
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, TraceEvent[]> = {};

        traces.forEach(trace => {
            if (!trace.transaction_id) return;
            if (!groups[trace.transaction_id]) {
                groups[trace.transaction_id] = [];
            }
            groups[trace.transaction_id].push(trace);
        });

        // Convert to array and sort by most recent event in the group
        return Object.entries(groups)
            .map(([transactionId, events]) => ({
                transactionId,
                events,
                lastActivity: new Date(events[0].created_at).getTime() // Assuming API returns sorted DESC
            }))
            .sort((a, b) => b.lastActivity - a.lastActivity);

    }, [traces]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        if (!filter) return groupedTransactions;
        const lowerFilter = filter.toLowerCase();

        return groupedTransactions.filter(({ transactionId, events }) =>
            transactionId.toLowerCase().includes(lowerFilter) ||
            events.some(e =>
                e.user_email.toLowerCase().includes(lowerFilter) ||
                e.action_type.toLowerCase().includes(lowerFilter) ||
                e.pharmacy_code.toLowerCase().includes(lowerFilter)
            )
        );
    }, [groupedTransactions, filter]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trazabilidad de Transacciones</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitoreo de flujos de autorización y logs de sistema</p>
                </div>
                <button
                    onClick={fetchTraces}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Actualizar
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por ID de transacción, usuario o farmacia..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-senasa-primary/20 focus:border-senasa-primary outline-none transition-all"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading && traces.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 size={32} className="text-senasa-primary animate-spin" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No se encontraron transacciones</p>
                    </div>
                ) : (
                    filteredTransactions.map(({ transactionId, events }) => (
                        <TransactionTimeline
                            key={transactionId}
                            transactionId={transactionId}
                            events={events}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
