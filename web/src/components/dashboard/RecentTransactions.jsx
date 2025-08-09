import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction, index) => (
              <motion.div
                key={transaction.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "Buy"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type === "Buy" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.shares} shares @{" "}
                      {formatCurrency(
                        transaction.average_price,
                        transaction.currency
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.currency}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      transaction.type === "Buy" ? "default" : "secondary"
                    }
                  >
                    {transaction.type}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatDate(transaction.transaction_date)}
                  </div>
                  {transaction.total_cost && (
                    <div className="font-medium">
                      {formatCurrency(
                        transaction.total_cost,
                        transaction.currency
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

RecentTransactions.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      symbol: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["Buy", "Sell"]).isRequired,
      shares: PropTypes.number.isRequired,
      average_price: PropTypes.number.isRequired,
      total_cost: PropTypes.number,
      currency: PropTypes.string.isRequired,
      transaction_date: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ]).isRequired,
    })
  ),
};
