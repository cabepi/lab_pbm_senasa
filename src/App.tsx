import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HomePage } from "./presentation/pages/HomePage";
import { AuthorizationsPage } from "./presentation/pages/AuthorizationsPage";
import { TraceabilityPage } from "./presentation/pages/TraceabilityPage";
import { MainLayout } from "./presentation/components/layout/MainLayout";
import { LoginPage } from "./components/LoginPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/authorizations" element={<AuthorizationsPage />} />
                    <Route path="/traces" element={<TraceabilityPage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
