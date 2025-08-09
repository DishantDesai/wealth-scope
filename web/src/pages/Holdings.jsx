import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "../components/header";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import HoldingsTable from "../components/dashboard/HoldingsTable";
import { mockData } from "../api";

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        const data = mockData.holdings;
        setHoldings(data);

        // Uncomment when backend is ready:
        // const data = await portfolioAPI.getHoldings();
        // setHoldings(data);
      } catch (error) {
        console.error("Error fetching holdings:", error);
        setError("Failed to load holdings data");
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // For development, use mock data
      const data = mockData.holdings;
      setHoldings(data);

      // Uncomment when backend is ready:
      // await portfolioAPI.recalculateHoldings();
      // const data = await portfolioAPI.getHoldings();
      // setHoldings(data);
    } catch (error) {
      console.error("Error refreshing holdings:", error);
      setError("Failed to refresh holdings data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarInset className="flex flex-col">
        <DashboardHeader
          title="Holdings"
          subtitle="Loading portfolio holdings..."
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded-lg animate-pulse"
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
        <DashboardHeader title="Holdings" subtitle="Error loading data" />
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="flex flex-col">
      <DashboardHeader
        title="Holdings"
        subtitle="Track individual stock performance and unrealized gains/losses"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Portfolio Holdings</h2>
            <p className="text-sm text-muted-foreground">
              Individual stock positions with performance metrics
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Holdings Table */}
        <HoldingsTable holdings={holdings} />
      </div>
    </SidebarInset>
  );
}
