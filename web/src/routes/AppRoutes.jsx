import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Holdings from "../pages/Holdings";
import Transactions from "../pages/Transactions";
import Dividends from "../pages/Dividends";
import AIInsights from "../pages/AIInsight";
import Settings from "../pages/Settings";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="holdings" element={<Holdings />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="dividends" element={<Dividends />} />
      <Route path="insights" element={<AIInsights />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
);

export default AppRoutes;
