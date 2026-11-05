
 // src/App.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy Loading - General Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const Rules = lazy(() => import("./pages/Rules"));

// Lazy Loading - HIRA
const HiraList = lazy(() => import("./pages/hira/HiraList"));
const HiraForm = lazy(() => import("./pages/hira/HiraForm"));
const HiraDetail = lazy(() => import("./pages/hira/HiraDetail"));

// Lazy Loading - Work Permit
const WorkPermitList = lazy(() => import("./pages/workPermit/WorkPermitList"));
const WorkPermitMenu = lazy(() => import("./pages/WorkPermitMenu"));

const WorkPermitHeightForm = lazy(
  () => import("./pages/workPermit/WorkPermitHeightForm")
);

const WorkPermitConfinedSpaceForm = lazy(
  () => import("./pages/workPermit/WorkPermitConfinedSpaceForm")
);

const WorkPermitHotWorkForm = lazy(
  () => import("./pages/workPermit/WorkPermitHotWorkForm")
);

const WorkPermitLiftingForm = lazy(
  () => import("./pages/workPermit/WorkPermitLiftingForm")
);

const WorkPermitTowerCraneForm = lazy(
  () => import("./pages/workPermit/WorkPermitTowerCraneForm")
);

const WorkPermitDetail = lazy(
  () => import("./pages/workPermit/WorkPermitDetail")
);

const WorkPermitPrint = lazy(
  () => import("./pages/workPermit/WorkPermitPrint")
);

// Lazy Loading - Public MK Approval
const MkApprovalPage = lazy(
  () => import("./pages/MkApprovalPage")
);

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="container py-5 text-center">
            <div
              className="spinner-border text-success"
              role="status"
              aria-label="Memuat halaman"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mt-2">
              Memuat halaman...
            </p>
          </div>
        }
      >
        <Routes>
          {/* Default ke /login */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Halaman Tanpa Navbar */}
          <Route
            path="/login"
            element={<Login />}
          />

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

          {/* Rules / Prosedur Operasional K3 */}
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
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
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

          {/* FORM WORK PERMITS - Working at Height */}
          <Route
            path="/work-permit/height"
            element={
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
                <AppLayout>
                  <WorkPermitHeightForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* FORM WORK PERMITS - Edit */}
          <Route
            path="/work-permit/:id/edit"
            element={
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
                <AppLayout>
                  <WorkPermitHeightForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* FORM WORK PERMITS - Confined Space */}
          <Route
            path="/work-permit/confined-space"
            element={
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
                <AppLayout>
                  <WorkPermitConfinedSpaceForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* FORM WORK PERMITS - Hot Work */}
          <Route
            path="/work-permit/hot-work"
            element={
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
                <AppLayout>
                  <WorkPermitHotWorkForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* FORM WORK PERMITS - Lifting */}
          <Route
            path="/work-permit/lifting"
            element={
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
                <AppLayout>
                  <WorkPermitLiftingForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* FORM WORK PERMITS - Tower Crane */}
          <Route
            path="/work-permit/tower-crane"
            element={
              <ProtectedRoute
                allowedRoles={["subcontractor"]}
              >
                <AppLayout>
                  <WorkPermitTowerCraneForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* DETAIL IZIN KERJA */}
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

          {/* PUBLIC ROUTE - MK APPROVAL */}
          <Route
            path="/mk/:token"
            element={<MkApprovalPage />}
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
