import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { motion } from "framer-motion";

export default function PortfolioChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Growth (CAD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const chartData = [
    {
      id: "Portfolio Value",
      color: "hsl(220, 70%, 50%)",
      data: data.map((point) => ({
        x: point.date,
        y: point.value,
      })),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Growth (CAD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveLine
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: "time", format: "%Y-%m-%d" }}
              xFormat="time:%Y-%m-%d"
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                format: "%b %d",
                legend: "Date",
                legendOffset: 36,
                legendPosition: "middle",
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (value) => `$${value.toLocaleString()}`,
                legend: "Value (CAD)",
                legendOffset: -50,
                legendPosition: "middle",
              }}
              pointSize={8}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                  anchor: "top",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: -20,
                  itemsSpacing: 0,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  symbolBorderColor: "rgba(0, 0, 0, .5)",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemBackground: "rgba(0, 0, 0, .03)",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              theme={{
                axis: {
                  domain: {
                    line: {
                      stroke: "#777777",
                      strokeWidth: 1,
                    },
                  },
                  ticks: {
                    line: {
                      stroke: "#777777",
                      strokeWidth: 1,
                    },
                    text: {
                      fill: "#333333",
                      fontSize: 11,
                    },
                  },
                  legend: {
                    text: {
                      fill: "#333333",
                      fontSize: 12,
                      fontWeight: "bold",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "#dddddd",
                    strokeWidth: 1,
                  },
                },
                legends: {
                  text: {
                    fill: "#333333",
                    fontSize: 11,
                  },
                },
                tooltip: {
                  container: {
                    background: "#ffffff",
                    color: "#333333",
                    fontSize: 12,
                    borderRadius: 4,
                    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
