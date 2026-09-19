"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function ImpactChart({
  data,
}: {
  data: Array<{ date: string; quantity: number; estimated: boolean }>;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde1d3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#47573f" }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: "#47573f" }} />
          <Tooltip
            formatter={(value) => [`${value} kg`, "Collected"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #dde1d3", fontSize: 13 }}
          />
          <Bar dataKey="quantity" radius={[6, 6, 0, 0]} fill="#4a8350" maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
