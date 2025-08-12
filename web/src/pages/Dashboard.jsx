import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "../components/header";
import PortfolioSummary from "../components/dashboard/PortfolioSummary";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import ExchangeRateDisplay from "../components/dashboard/ExchangeRateDisplay";
import { portfolioAPI } from "../api";

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState(null);
  // const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [summaryData] = await portfolioAPI.getPortfolioSummary();
        console.log(summaryData);
        setPortfolioData(summaryData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate mock chart data for development
  const generateChartData = () => {
    const data = [];
    const startDate = new Date("2024-01-01");
    let currentValue = 33750; // Starting with CAD value

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Simulate some growth
      currentValue += Math.random() * 200 - 100;

      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.max(currentValue, 30000),
      });
    }

    return data;
  };

  if (loading) {
    return (
      <SidebarInset className="flex flex-col">
        <DashboardHeader
          title="Dashboard"
          subtitle="Loading your portfolio data..."
        />
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset className="flex flex-col">
        <DashboardHeader title="Dashboard" subtitle="Error loading data" />
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="flex flex-col">
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your portfolio overview."
      />
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Portfolio Summary Cards */}
        <PortfolioSummary portfolioData={portfolioData} />

        {/* Exchange Rate Display */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PortfolioChart data={generateChartData()} />
          </div>
          <div>
            <ExchangeRateDisplay />
          </div>
        </div>

        {/* Recent Transactions */}
        {/* <RecentTransactions transactions={transactions} /> */}
      </div>
    </SidebarInset>
  );
}
