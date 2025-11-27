import { RouterProvider, createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";

const HomepageLayout = lazy(() => import("./layouts/homepage/homepageLayout"));
const Homepage = lazy(() => import("./components/homepage/homepage"));
const Login = lazy(() => import("./pages/authentication/login/login"));
const ProfilePage = lazy(() => import("./layouts/profile/profileLayout"));
const Register = lazy(() => import("./pages/authentication/register/register"));
const VerifyOtp = lazy(() => import("./pages/authentication/verify-otp/verifyOtp"));
const Information = lazy(() => import("./pages/information/information"));
const Hamster = lazy(() => import("./pages/hamster/hamster"));

const decodeTokenSafe = (rawToken: string | null) => {
  if (!rawToken) return null;
  try {
    const payload = rawToken.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

function PrivateRouteUser() {
  const token = sessionStorage.getItem("token");
  const user = decodeTokenSafe(token);
  if (!token || !user || user.role !== "USER") return <Navigate to="/login" replace />;
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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
