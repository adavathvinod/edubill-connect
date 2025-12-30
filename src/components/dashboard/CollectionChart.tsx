import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jul", collected: 245000, pending: 85000 },
  { month: "Aug", collected: 312000, pending: 62000 },
  { month: "Sep", collected: 285000, pending: 95000 },
  { month: "Oct", collected: 358000, pending: 42000 },
  { month: "Nov", collected: 395000, pending: 55000 },
  { month: "Dec", collected: 420000, pending: 38000 },
];

export function CollectionChart() {
  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "250ms" }}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg text-foreground">Fee Collection Trend</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Pending</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow: "var(--shadow-lg)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
            />
            <Bar
              dataKey="collected"
              fill="hsl(var(--secondary))"
              radius={[6, 6, 0, 0]}
              name="Collected"
            />
            <Bar
              dataKey="pending"
              fill="hsl(var(--warning))"
              radius={[6, 6, 0, 0]}
              name="Pending"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
