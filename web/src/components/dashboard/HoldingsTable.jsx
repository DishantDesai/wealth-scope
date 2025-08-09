import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function HoldingsTable({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No holdings found
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const formatCurrency = (amount, currency = "CAD") => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const totalInvestedCAD = holdings.reduce(
    (sum, holding) => sum + holding.totalInvestedCAD,
    0
  );
  const totalMarketValueCAD = holdings.reduce(
    (sum, holding) => sum + holding.marketValueCAD,
    0
  );
  const totalUnrealizedGainLossCAD = holdings.reduce(
    (sum, holding) => sum + holding.unrealizedGainLossCAD,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total Value: {formatCurrency(totalMarketValueCAD, "CAD")} | Total
            Invested: {formatCurrency(totalInvestedCAD, "CAD")} | Unrealized
            P&L: {formatCurrency(totalUnrealizedGainLossCAD, "CAD")}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Symbol</th>
                  <th className="text-right py-3 px-4 font-medium">Quantity</th>
                  <th className="text-right py-3 px-4 font-medium">
                    Avg Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    Current Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    Market Value
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    Unrealized P&L
                  </th>
                  <th className="text-right py-3 px-4 font-medium">% Return</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding, index) => (
                  <motion.tr
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {holding.currency}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      {holding.quantity.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>
                        {formatCurrency(holding.avgBuyPrice, holding.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(holding.avgBuyPriceCAD, "CAD")}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>
                        {formatCurrency(holding.currentPrice, holding.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(holding.currentPriceCAD, "CAD")}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div>
                        {formatCurrency(holding.marketValue, holding.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(holding.marketValueCAD, "CAD")}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          holding.unrealizedGainLoss >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {holding.unrealizedGainLoss >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatCurrency(
                          holding.unrealizedGainLoss,
                          holding.currency
                        )}
                      </div>
                      <div
                        className={`text-xs ${
                          holding.unrealizedGainLossCAD >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(holding.unrealizedGainLossCAD, "CAD")}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        variant={
                          holding.unrealizedGainLossPercentage >= 0
                            ? "default"
                            : "secondary"
                        }
                        className={
                          holding.unrealizedGainLossPercentage >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {holding.unrealizedGainLossPercentage >= 0 ? "+" : ""}
                        {formatNumber(holding.unrealizedGainLossPercentage)}%
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

HoldingsTable.propTypes = {
  holdings: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      avgBuyPrice: PropTypes.number.isRequired,
      avgBuyPriceCAD: PropTypes.number.isRequired,
      currentPrice: PropTypes.number.isRequired,
      currentPriceCAD: PropTypes.number.isRequired,
      totalInvested: PropTypes.number.isRequired,
      totalInvestedCAD: PropTypes.number.isRequired,
      marketValue: PropTypes.number.isRequired,
      marketValueCAD: PropTypes.number.isRequired,
      unrealizedGainLoss: PropTypes.number.isRequired,
      unrealizedGainLossCAD: PropTypes.number.isRequired,
      unrealizedGainLossPercentage: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
      lastUpdated: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
        .isRequired,
    })
  ),
};
