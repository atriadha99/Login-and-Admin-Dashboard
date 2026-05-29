import React from "react";
import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import FilterPage from "./pages/FilterPage";
import DataConnectionPage from "./pages/DataConnectionPage";
import ArmadaPage from "./pages/ArmadaPage";
import DriverPage from "./pages/DriverPage";
import PenjualanPage from "./pages/PenjualanPage";
import DistribusiPage from "./pages/DistribusiPage";
import ForecastingPage from "./pages/ForecastingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "armada", element: <ArmadaPage /> },
      { path: "driver", element: <DriverPage /> },
      { path: "penjualan", element: <PenjualanPage /> },
      { path: "distribusi", element: <DistribusiPage /> },
      { path: "forecasting", element: <ForecastingPage /> },
      { path: "filter", element: <FilterPage /> },
      { path: "data", element: <DataConnectionPage /> },
    ],
  },
]);
