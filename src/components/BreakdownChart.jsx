import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';

const BreakdownChart = ({ data, totalLabel, totalValue, color }) => {
    return (
        <div style={{ width: '100%', height: 250, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || color} />
                        ))}
                        <Label
                            value={totalValue}
                            position="center"
                            dy={-10}
                            style={{ fontSize: '28px', fontWeight: 700, fill: 'var(--notion-text)' }}
                        />
                        <Label
                            value={totalLabel}
                            position="center"
                            dy={15}
                            style={{ fontSize: '12px', fill: 'var(--notion-text-gray)' }}
                        />
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BreakdownChart;
