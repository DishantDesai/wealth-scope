import { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "../components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { mockData } from "../api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        const data = mockData.transactions;
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(
      (transaction) =>
        transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

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

  if (loading) {
    return (
      <SidebarInset className="flex flex-col">
        <DashboardHeader
          title="Transactions"
          subtitle="Loading transaction history..."
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
        title="Transactions"
        subtitle="View and manage your investment transactions"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                        <span className="text-sm font-medium">
                          {transaction.type === "Buy" ? "BUY" : "SELL"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-lg">
                          {transaction.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.shares} shares @{" "}
                          {formatCurrency(
                            transaction.average_price,
                            transaction.currency
                          )}
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
                        <div className="font-medium text-lg">
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
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
