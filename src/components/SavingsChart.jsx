import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SavingsChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300, fontSize: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-blue)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="var(--chart-blue)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {/* Grid removed to clean up UI */}
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9b9a97' }}
                        tickMargin={10}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9b9a97' }}
                        tickFormatter={(value) => `$${value / 1000}K`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '4px', border: '1px solid var(--notion-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                        formatter={(value) => [`$${value}`, 'Savings']}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--chart-blue)"
                        fillOpacity={1}
                        fill="url(#colorSavings)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SavingsChart;
