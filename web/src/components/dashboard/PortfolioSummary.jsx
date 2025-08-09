import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react";
import { motion } from "framer-motion";

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  isPositive = true,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          $
          {value.toLocaleString("en-CA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        {change && (
          <div
            className={`flex items-center text-xs ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1">CAD</div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function PortfolioSummary({ portfolioData }) {
  if (!portfolioData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { totalInvested, totalDividendsYTD, portfolioValue, gainLoss } =
    portfolioData;
  const gainLossPercentage =
    totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Invested"
        value={totalInvested}
        icon={DollarSign}
      />

      <MetricCard
        title="Portfolio Value"
        value={portfolioValue}
        change={gainLossPercentage}
        isPositive={gainLoss >= 0}
        icon={TrendingUp}
      />

      <MetricCard
        title="Dividends YTD"
        value={totalDividendsYTD}
        icon={Coins}
      />

      <MetricCard
        title="Total Gain/Loss"
        value={gainLoss}
        change={gainLossPercentage}
        isPositive={gainLoss >= 0}
        icon={gainLoss >= 0 ? TrendingUp : TrendingDown}
      />
    </div>
  );
}
