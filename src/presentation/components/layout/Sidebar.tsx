import { Link, useLocation } from "react-router-dom";
import { Home, Settings, FileText, Activity } from "lucide-react";

export const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 hidden md:flex flex-col">
            {/* Logo Area */}
            <div className="flex items-center h-20 px-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {/* SeNaSa Logo approximation */}
                    <div className="w-10 h-10 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-senasa-primary" fill="currentColor">
                            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z" />
                            <path d="M50 20c-16.6 0-30 13.4-30 30s13.4 30 30 30 30-13.4 30-30-13.4-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-senasa-primary text-xl leading-tight">SeNaSa</span>
                        <span className="text-xs text-gray-500 tracking-wide">Seguro Nacional de Salud</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <NavItem icon={<Home size={20} />} label="Inicio" to="/" active={location.pathname === "/"} />
                <NavItem icon={<FileText size={20} />} label="Autorizaciones" to="/authorizations" active={location.pathname === "/authorizations"} />
                <NavItem icon={<Activity size={20} />} label="Trazabilidad" to="/traces" active={location.pathname === "/traces"} />
            </nav>

            {/* Footer Settings */}
            <div className="p-4 border-t border-gray-100">
                <NavItem icon={<Settings size={20} />} label="Configuración" to="/settings" />
            </div>
        </aside>
    );
};

const NavItem: React.FC<{ icon?: React.ReactNode; label: string; to: string; active?: boolean }> = ({ icon, label, to, active }) => {
    return (
        <Link
            to={to}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                ? "bg-senasa-light text-senasa-primary border-l-4 border-senasa-primary"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            {icon && <span className="mr-3 text-current">{icon}</span>}
            {label}
        </Link>
    );
};
