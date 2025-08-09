import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
// import { portfolioAPI } from "../../api";

export default function ExchangeRateDisplay() {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        const mockRate = {
          rate: 1.35,
          from: "USD",
          to: "CAD",
          timestamp: new Date().toISOString(),
        };
        setExchangeRate(mockRate);

        // Uncomment when backend is ready:
        // const data = await portfolioAPI.getExchangeRate();
        // setExchangeRate(data);
      } catch (err) {
        console.error("Error fetching exchange rate:", err);
        setError("Failed to load exchange rate");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Exchange Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Exchange Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Exchange Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              1 USD = {exchangeRate.rate.toFixed(4)} CAD
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated:{" "}
              {new Date(exchangeRate.timestamp).toLocaleString("en-CA")}
            </div>
            <div className="text-xs text-muted-foreground">
              All USD transactions are automatically converted to CAD for
              portfolio calculations
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
