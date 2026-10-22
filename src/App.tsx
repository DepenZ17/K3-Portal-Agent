// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import HiraList from "./pages/hira/HiraList";
import HiraForm from "./pages/hira/HiraForm";
import HiraDetail from "./pages/hira/HiraDetail";
import AuditTrail from "./pages/AuditTrail";
import Rules from "./pages/Rules";
import WorkPermitList from "./pages/workPermit/WorkPermitList";
import WorkPermitMenu from "./pages/WorkPermitMenu";

import WorkPermitHeightForm from "./pages/workPermit/WorkPermitHeightForm";
import WorkPermitConfinedSpaceForm from "./pages/workPermit/WorkPermitConfinedSpaceForm";
import WorkPermitHotWorkForm from "./pages/workPermit/WorkPermitHotWorkForm";
import WorkPermitLiftingForm from "./pages/workPermit/WorkPermitLiftingForm";
import WorkPermitTowerCraneForm from "./pages/workPermit/WorkPermitTowerCraneForm";

import WorkPermitDetail from "./pages/workPermit/WorkPermitDetail";
import WorkPermitPrint from "./pages/workPermit/WorkPermitPrint";

import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Halaman Tanpa Navbar */}
        <Route path="/login" element={<Login />} />

        {/* Halaman Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <AppLayout>
              <Unauthorized />
            </AppLayout>
          }
        />

        {/* Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* HIRA List */}
        <Route
          path="/hira"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <HiraList />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* HIRA Form (Buat Baru) */}
        <Route
          path="/hira/create"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
              ]}
            >
              <AppLayout>
                <HiraForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* HIRA Form (Edit) */}
        <Route
          path="/hira/edit/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
              ]}
            >
              <AppLayout>
                <HiraForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* HIRA Detail & Approval Actions */}
        <Route
          path="/hira/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <HiraDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Audit Trail */}
        <Route
          path="/audit"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <AuditTrail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Rules / Regulasi */}
        <Route
          path="/rules"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <Rules />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* MENU UTAMA IZIN KERJA */}
        <Route
          path="/work-permit"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitMenu />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* LIST SEMUA IZIN KERJA */}
        <Route
          path="/work-permit/list"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <WorkPermitList />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* FORM WORK PERMITS (Create & Edit) */}
        <Route
          path="/work-permit/height"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitHeightForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permit/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitHeightForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permit/confined-space"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitConfinedSpaceForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permit/hot-work"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitHotWorkForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permit/lifting"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitLiftingForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/work-permit/tower-crane"
          element={
            <ProtectedRoute allowedRoles={["subcontractor"]}>
              <AppLayout>
                <WorkPermitTowerCraneForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* DETAIL IZIN KERJA (Ditempatkan setelah rute spesifik form/edit) */}
        <Route
          path="/work-permit/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <WorkPermitDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* PRINT IZIN KERJA */}
        <Route
          path="/work-permit/:id/print"
          element={
            <ProtectedRoute
              allowedRoles={[
                "subcontractor",
                "hse_officer",
                "hse_coordinator",
                "supervisor",
                "project_manager",
              ]}
            >
              <AppLayout>
                <WorkPermitPrint />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;