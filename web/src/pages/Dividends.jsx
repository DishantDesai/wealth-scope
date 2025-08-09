import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "../components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";
import { mockData } from "../api";

export default function DividendsPage() {
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDividends = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        const data = mockData.dividends;
        setDividends(data);
      } catch (error) {
        console.error("Error fetching dividends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDividends();
  }, []);

  const formatDate = (date) => {
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("en-CA");
    }
    if (date?.toDate) {
      return date.toDate().toLocaleDateString("en-CA");
    }
    return new Date(date).toLocaleDateString("en-CA");
  };

  const formatCurrency = (amount, currency = "CAD") => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Generate chart data for dividends by symbol
  const generateChartData = () => {
    const symbolTotals = {};
    dividends.forEach((dividend) => {
      if (symbolTotals[dividend.symbol]) {
        symbolTotals[dividend.symbol] += dividend.amount;
      } else {
        symbolTotals[dividend.symbol] = dividend.amount;
      }
    });

    return Object.entries(symbolTotals).map(([symbol, amount]) => ({
      symbol,
      amount: parseFloat(amount.toFixed(2)),
    }));
  };

  const totalDividends = dividends.reduce(
    (sum, dividend) => sum + dividend.amount,
    0
  );

  if (loading) {
    return (
      <SidebarInset className="flex flex-col">
        <DashboardHeader
          title="Dividends"
          subtitle="Loading dividend data..."
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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

  return (
    <SidebarInset className="flex flex-col">
      <DashboardHeader
        title="Dividends"
        subtitle="Track your dividend income and payments"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Total Dividends YTD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(totalDividends)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {dividends.length} dividend payments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts and Data Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dividend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Dividends by Symbol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {dividends.length > 0 ? (
                    <ResponsiveBar
                      data={generateChartData()}
                      keys={["amount"]}
                      indexBy="symbol"
                      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                      padding={0.3}
                      valueScale={{ type: "linear" }}
                      colors={{ scheme: "nivo" }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Symbol",
                        legendPosition: "middle",
                        legendOffset: 32,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        format: (value) => `$${value}`,
                        legend: "Amount ($)",
                        legendPosition: "middle",
                        legendOffset: -50,
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{
                        from: "color",
                        modifiers: [["darker", 1.6]],
                      }}
                      animate={true}
                      motionStiffness={90}
                      motionDamping={15}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No dividend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Dividends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Dividend Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {dividends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No dividend payments found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dividends.slice(0, 10).map((dividend, index) => (
                      <motion.div
                        key={dividend.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <span className="text-sm font-medium">DIV</span>
                          </div>
                          <div>
                            <div className="font-medium text-lg">
                              {dividend.symbol}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(dividend.payment_date)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg text-green-600">
                            {formatCurrency(dividend.amount, dividend.currency)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SidebarInset>
  );
}
