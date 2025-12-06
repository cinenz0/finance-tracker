import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, TrendingUp, Wallet, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import TransactionList from './TransactionList';

const COLORS = ['#5b9bf1', '#ea6b6b', '#59b98c', '#d3d1cb'];

const Dashboard = () => {
    const { transactions, incomeBreakdown, expensesBreakdown, savingsData } = useFinance();
    const { accountName, profileImage } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialTab, setInitialTab] = useState('expense'); // 'income' or 'expense'
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleOpenModal = (type) => {
        setInitialTab(type);
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction) => {
        setInitialTab(transaction.type);
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    // 2. Income vs Expenses (Donut)
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const formatCompact = (value) => {
        if (value >= 1000000) {
            return `R$ ${(value / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`;
        }
        if (value >= 1000) {
            return `R$ ${(value / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
        }
        return `R$ ${value.toLocaleString('pt-BR')}`;
    };

    return (
        <div style={{ padding: '32px 48px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={initialTab}
                transactionToEdit={editingTransaction}
            />

            {/* Header / Cover */}
            <div style={{ marginBottom: '48px' }}>
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile"
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginBottom: '16px'
                        }}
                    />
                ) : (
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'var(--notion-text)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--notion-bg)',
                        marginBottom: '16px',
                        fontSize: '40px',
                        fontWeight: 'bold'
                    }}>
                        {accountName.charAt(0).toUpperCase()}
                    </div>
                )}
                <h1 style={{ fontSize: '40px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {accountName}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--notion-text-gray)', border: '1px solid var(--notion-border)', padding: '2px 6px', borderRadius: '4px' }}>v0.0.15</span>
                </h1>
            </div>

            {/* Charts Section - Responsive Flex */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '48px' }}>

                {/* 1. Savings Trend (Wider) */}
                <div style={{ flex: '2 1 500px', border: '1px solid var(--notion-border)', borderRadius: '4px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                            <TrendingUp size={16} /> Savings Trend
                        </div>
                        <button onClick={() => handleOpenModal('income')} style={{ background: '#2383e2', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            New <ChevronDown size={12} />
                        </button>
                    </div>
                    <div style={{ flex: 1, minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={savingsData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9b9a97' }} />
                                <Tooltip cursor={false} formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="amount" stroke="#5b9bf1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Income Breakdown (Detailed) */}
                <div style={{ flex: '1 1 350px', border: '1px solid var(--notion-border)', borderRadius: '4px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--notion-text-gray)' }}>
                            <PieChartIcon size={16} /> Income Breakdown
                        </div>
                        <button onClick={() => handleOpenModal('income')} style={{ background: 'var(--notion-hover)', color: 'var(--notion-text)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'var(--notion-border)'} onMouseLeave={(e) => e.target.style.background = 'var(--notion-hover)'}>
                            Add <ChevronDown size={12} />
                        </button>
                    </div>
                    <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incomeBreakdown.length > 0 ? incomeBreakdown : [{ name: 'Empty', value: 1, color: '#333' }]}
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(incomeBreakdown.length > 0 ? incomeBreakdown : [{ color: 'var(--notion-border)' }]).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} contentStyle={{ backgroundColor: 'var(--notion-bg)', border: '1px solid var(--notion-border)', color: 'var(--notion-text)', borderRadius: '4px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--notion-text)' }}>{formatCompact(income)}</div>
                            <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)' }}>Total Amount</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
                        {incomeBreakdown.slice(0, 4).map(item => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: item.color }}></div>
                                <span style={{ color: 'var(--notion-text-gray)' }}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Expenses Breakdown (Detailed) */}
                <div style={{ flex: '1 1 350px', border: '1px solid var(--notion-border)', borderRadius: '4px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--notion-text-gray)' }}>
                            <PieChartIcon size={16} /> Expenses Breakdown
                        </div>
                        <button onClick={() => handleOpenModal('expense')} style={{ background: 'var(--notion-hover)', color: 'var(--notion-text)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'var(--notion-border)'} onMouseLeave={(e) => e.target.style.background = 'var(--notion-hover)'}>
                            Add <ChevronDown size={12} />
                        </button>
                    </div>
                    <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expensesBreakdown.length > 0 ? expensesBreakdown : [{ name: 'Empty', value: 1, color: '#333' }]}
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(expensesBreakdown.length > 0 ? expensesBreakdown : [{ color: 'var(--notion-border)' }]).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} contentStyle={{ backgroundColor: 'var(--notion-bg)', border: '1px solid var(--notion-border)', color: 'var(--notion-text)', borderRadius: '4px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--notion-text)' }}>{formatCompact(expenses)}</div>
                            <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)' }}>Total Amount</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
                        {expensesBreakdown.slice(0, 6).map(item => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: item.color }}></div>
                                <span style={{ color: 'var(--notion-text-gray)' }}>{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                <TransactionList
                    title="Income"
                    transactions={transactions.filter(t => t.type === 'income')}
                    onAdd={() => handleOpenModal('income')}
                    onEdit={handleOpenEditModal}
                />
                <TransactionList
                    title="Expenses"
                    transactions={transactions.filter(t => t.type === 'expense')}
                    onAdd={() => handleOpenModal('expense')}
                    onEdit={handleOpenEditModal}
                />
            </div>

        </div>
    );
};

export default Dashboard;
