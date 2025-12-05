import { RouterProvider, createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import ManageAccount from "./pages/admin/account/ManageAccount";
import ManageComboServices from "./pages/admin/combo-services/ManageComboServices";

const HomepageLayout = lazy(() => import("./layouts/homepage/homepageLayout"));
const Homepage = lazy(() => import("./components/homepage/homepage"));
const Login = lazy(() => import("./pages/authentication/login/login"));
const ProfilePage = lazy(() => import("./layouts/profile/profileLayout"));
const Register = lazy(() => import("./pages/authentication/register/register"));
const VerifyOtp = lazy(() => import("./pages/authentication/verify-otp/verifyOtp"));
const Information = lazy(() => import("./pages/information/information"));
const Hamster = lazy(() => import("./pages/hamster/hamster"));
const Sidebar = lazy(() => import("./components/sidebar/Sidebar"));
const GroomingService = lazy(() => import("./pages/grooming/grooming-page/GroomingService"));
const GroomingDetail = lazy(() => import("./pages/grooming/grooming-page-detail/GroomingDetail"));
const ManageSingleServices = lazy(() => import("./pages/admin/single-services/ManageSingleServices"));
const ManageSingleServiceDetail = lazy(() => import("./pages/admin/single-services/ManageSingleServiceDetail"));
const PaymentSuccess = lazy(() => import("./pages/payment/success/PaymentSuccess"));
const PaymentFail = lazy(() => import("./pages/payment/fail/PaymentFail"));

const decodeTokenSafe = (rawToken: string | null) => {
  if (!rawToken) return null;

  const token = rawToken.startsWith("Bearer ") ? rawToken.substring(7) : rawToken;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    let payload = parts[1];

    payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4 !== 0) payload += "=";

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Decode token error:", err);
    return null;
  }
};

/* --------------------------------------------------------
 *  FIX 2: Support all role formats (KEYCLOAK + CUSTOM)
 * ------------------------------------------------------*/
const getRolesFromTokenPayload = (payload): string[] => {
  if (!payload) return [];

  // Keycloak format
  if (Array.isArray(payload?.realm_access?.roles)) {
    return payload.realm_access.roles;
  }

  // Custom single role
  if (typeof payload.role === "string") return [payload.role];
  if (typeof payload.ROLE === "string") return [payload.ROLE];

  // Array roles
  if (Array.isArray(payload.roles)) return payload.roles;

  // Other possible structures
  if (Array.isArray(payload.authorities)) return payload.authorities;

  return [];
};

/* --------------------------------------------------------
 *  FIX 3: Private Route User
 * ------------------------------------------------------*/
function PrivateRouteUser() {
  const token = sessionStorage.getItem("token");
  const user = decodeTokenSafe(token);
  const roles = getRolesFromTokenPayload(user);

  if (!token || !user || !roles.includes("USER")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/* --------------------------------------------------------
 *  FIX 4: Private Route Admin
 * ------------------------------------------------------*/
function PrivateRouteAdmin() {
  const token = sessionStorage.getItem("token");
  const user = decodeTokenSafe(token);
  const roles = getRolesFromTokenPayload(user);

  if (!token || !user || !roles.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <HomepageLayout />
        </Suspense>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Homepage />
            </Suspense>
          ),
        },
        {
          path: "/payment-success",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <PaymentSuccess />
            </Suspense>
          ),
        },
        {
          path: "/payment-fail",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <PaymentFail />
            </Suspense>
          ),
        },
        {
          path: "/login",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Login />
            </Suspense>
          ),
        },
        {
          path: "/register",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Register />
            </Suspense>
          ),
        },
        {
          path: "/verify-otp",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <VerifyOtp />
            </Suspense>
          ),
        },
        {
          element: <PrivateRouteUser />,
          children: [
            {
              path: "information",
              element: (
                <Suspense fallback={<div>Loading...</div>}>
                  <ProfilePage />
                </Suspense>
              ),
              children: [
                {
                  index: true,
                  element: <Information />,
                },
              ],
            },
          ],
        },
        {
          element: <PrivateRouteUser />,
          children: [
            {
              path: "hamsters",
              element: (
                <Suspense fallback={<div>Loading...</div>}>
                  <ProfilePage />
                </Suspense>
              ),
              children: [
                {
                  index: true,
                  element: <Hamster />,
                },
              ],
            },
          ],
        },
        {
          element: <PrivateRouteUser />,
          children: [
            {
              path: "lich-lam-dep",
              element: (
                <Suspense fallback={<div>Loading...</div>}>
                  <GroomingService />
                </Suspense>
              ),
            },
            {
              path: "lich-lam-dep/:id",
              element: (
                <Suspense fallback={<div>Loading...</div>}>
                  <GroomingDetail />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },

    {
      element: <PrivateRouteAdmin />,
      children: [
        {
          path: "admin",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Sidebar />
            </Suspense>
          ),
          children: [
            {
              path: "dashboard",
              element: <div>Admin Dashboard</div>,
            },
            {
              path: "services/single",
              element: <ManageSingleServices />,
            },
            {
              path: "services/single/:id",
              element: <ManageSingleServiceDetail />,
            },
            {
              path: "services/combo",
              element: <ManageComboServices />,
            },
            {
              path: "accounts",
              element: <ManageAccount />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
