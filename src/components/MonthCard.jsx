import { Circle } from 'lucide-react';

const MonthCard = ({ month }) => {
    // month: { name, income, expenses, net }
    return (
        <div style={{
            border: '1px solid var(--notion-border)',
            borderRadius: '4px',
            padding: '12px 16px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'background 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--notion-bg-gray)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                <Circle size={10} fill="var(--chart-blue)" stroke="none" />
                {month.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--notion-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--notion-text-gray)' }}>Income:</span>
                    <span>${month.income}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--notion-text-gray)' }}>Expenses:</span>
                    <span>${month.expenses}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: 'var(--notion-text-gray)' }}>Net:</span>
                    <span style={{ fontWeight: 600 }}>${month.net}</span>
                </div>
            </div>
        </div>
    );
};

export default MonthCard;
