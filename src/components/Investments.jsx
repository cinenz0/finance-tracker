import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';
import { Plus, X, PieChart, Calendar, TrendingUp, AlertCircle, Trash2, Edit2, Settings } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Investments = () => {
    const { investments, addInvestment, deleteInvestment, updateInvestment, portfolioBreakdown } = useFinance();
    const { investmentTypes, addInvestmentType, updateInvestmentType, deleteInvestmentType, getTagColor } = useSettings();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);

    // Add/Edit Form State
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('CDB');
    const [rate, setRate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [maturityDate, setMaturityDate] = useState('');

    // Editing State
    const [editingId, setEditingId] = useState(null);

    // Types Management State
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeColor, setNewTypeColor] = useState('#000000');
    const [editingTypeId, setEditingTypeId] = useState(null);

    const totalValue = investments.reduce((sum, item) => sum + item.amount, 0);

    // Map colors to breakdown
    const coloredBreakdown = portfolioBreakdown.map(item => {
        const typeObj = investmentTypes.find(t => t.name === item.name);
        const color = typeObj ? getTagColor(typeObj.color).bg : '#e3e2e0'; // fallback gray
        return { ...item, color };
    });

    const handleOpenModal = (investmentToEdit = null) => {
        if (investmentToEdit) {
            setEditingId(investmentToEdit.id);
            setName(investmentToEdit.name);
            setAmount(investmentToEdit.amount.toString());
            setType(investmentToEdit.type);
            setRate(investmentToEdit.rate || '');
            setStartDate(investmentToEdit.startDate || new Date().toISOString().split('T')[0]);
            setMaturityDate(investmentToEdit.maturityDate || '');
        } else {
            setEditingId(null);
            setName('');
            setAmount('');
            // Default to first available type
            setType(investmentTypes.length > 0 ? investmentTypes[0].name : '');
            setRate('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setMaturityDate('');
        }
        setIsAddModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const investmentData = {
            name,
            amount: parseFloat(amount),
            type,
            rate,
            startDate,
            maturityDate
        };

        if (editingId) {
            await updateInvestment({ id: editingId, ...investmentData });
        } else {
            await addInvestment(investmentData);
        }

        setIsAddModalOpen(false);
    };

    const handleAddType = (e) => {
        e.preventDefault();
        if (newTypeName) {
            if (editingTypeId) {
                updateInvestmentType(editingTypeId, { name: newTypeName, color: newTypeColor });
                setEditingTypeId(null);
            } else {
                addInvestmentType(newTypeName, newTypeColor);
            }
            setNewTypeName('');
            setNewTypeColor('#000000');
        }
    };

    const handleEditType = (type) => {
        setNewTypeName(type.name);
        // If it's a hex or name, pass it through. Ideally use getTagColor().bg for visual but keep raw for edit?
        // Let's assume raw color value (name or hex)
        setNewTypeColor(type.color);
        setEditingTypeId(type.id);
    };

    const formatCurrency = (val) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div style={{ padding: '32px 48px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Investments</h1>
                    <div style={{ fontSize: '14px', color: 'var(--notion-text-gray)' }}>
                        Manage your portfolio and assets
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsTypesModalOpen(true)}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--notion-text)',
                            border: '1px solid var(--notion-border)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Settings size={16} /> Types
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            backgroundColor: 'var(--notion-text)',
                            color: 'var(--notion-bg)',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Plus size={16} /> New Investment
                    </button>
                </div>
            </div>

            {/* Portfolio Summary Card */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', flexWrap: 'wrap' }}>
                {/* Chart */}
                <div style={{ flex: 1, minWidth: '300px', height: '300px', backgroundColor: 'var(--notion-bg)', border: '1px solid var(--notion-border)', borderRadius: '8px', padding: '24px', position: 'relative' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>Allocation</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={coloredBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {coloredBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'var(--notion-bg)', border: '1px solid var(--notion-border)', borderRadius: '4px' }} />
                        </RePieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center', pointerEvents: 'none' }}>
                        <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Total</div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>{investments.length > 0 ? formatCurrency(totalValue) : 'R$ 0'}</div>
                    </div>
                </div>

                {/* Legend / Stats */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {coloredBreakdown.map((item) => (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--notion-border)', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatCurrency(item.value)}</span>
                        </div>
                    ))}
                    {coloredBreakdown.length === 0 && (
                        <div style={{ color: 'var(--notion-text-gray)', fontSize: '14px', fontStyle: 'italic' }}>No investments yet.</div>
                    )}
                </div>
            </div>

            {/* List */}
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--notion-border)', paddingBottom: '8px' }}>Assets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {investments.map((item) => {
                        const typeObj = investmentTypes.find(t => t.name === item.type);
                        const typeColor = typeObj ? getTagColor(typeObj.color).bg : 'var(--notion-hover)';
                        const typeTextColor = typeObj ? getTagColor(typeObj.color).text : 'var(--notion-text)';

                        return (
                            <div key={item.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: '1px solid var(--notion-border)',
                                fontSize: '14px'
                            }}>
                                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: typeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={16} color={typeTextColor} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)' }}>{item.type} • {item.rate}</div>
                                    </div>
                                </div>

                                <div style={{ flex: 1, textAlign: 'left', color: 'var(--notion-text-gray)' }}>
                                    {item.maturityDate ? `Matures: ${new Date(item.maturityDate).toLocaleDateString()}` : 'No maturity'}
                                </div>

                                <div style={{ flex: 1, textAlign: 'right', fontWeight: 600, fontSize: '16px' }}>
                                    {formatCurrency(item.amount)}
                                </div>

                                <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-text-gray)' }}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => { if (window.confirm('Delete investment?')) deleteInvestment(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea6b6b' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {investments.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--notion-text-gray)' }}>No investments recorded.</div>
                    )}
                </div>
            </div>

            {/* Types Management Modal */}
            {isTypesModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setIsTypesModalOpen(false)}>
                    <div style={{
                        backgroundColor: 'var(--notion-bg)',
                        width: '400px',
                        maxHeight: '80vh',
                        borderRadius: '8px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--notion-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Manage Investment Types</h2>
                            <button onClick={() => setIsTypesModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-text-gray)' }}><X size={18} /></button>
                        </div>

                        <div style={{ padding: '16px', borderBottom: '1px solid var(--notion-border)' }}>
                            <form onSubmit={handleAddType} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    placeholder="New Type Name"
                                    value={newTypeName}
                                    onChange={e => setNewTypeName(e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'transparent', color: 'var(--notion-text)' }}
                                />
                                <input
                                    type="color"
                                    value={getTagColor(newTypeColor).bg.startsWith('#') ? getTagColor(newTypeColor).bg : '#000000'} // simple hex extraction for picker
                                    onChange={e => setNewTypeColor(e.target.value)}
                                    style={{ width: '40px', padding: '0', border: 'none', background: 'none', cursor: 'pointer' }}
                                />
                                <button type="submit" style={{ padding: '8px 16px', backgroundColor: 'var(--notion-text)', color: 'var(--notion-bg)', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                                    {editingTypeId ? 'Save' : 'Add'}
                                </button>
                            </form>
                        </div>

                        <div style={{ padding: '16px', overflowY: 'auto' }}>
                            {investmentTypes.map(type => {
                                const colors = getTagColor(type.color);
                                return (
                                    <div key={type.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', marginBottom: '4px', borderRadius: '4px', backgroundColor: 'var(--notion-hover)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.bg, border: '1px solid var(--notion-border)' }}></div>
                                            <span style={{ fontWeight: 500 }}>{type.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditType(type)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-text-gray)' }}><Edit2 size={14} /></button>
                                            <button onClick={() => { if (window.confirm('Delete this type?')) deleteInvestmentType(type.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea6b6b' }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setIsAddModalOpen(false)}>
                    <div style={{
                        backgroundColor: 'var(--notion-bg)',
                        width: '400px',
                        borderRadius: '8px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--notion-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{editingId ? 'Edit Investment' : 'New Investment'}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-text-gray)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Name</label>
                                <input
                                    required
                                    placeholder="e.g. CDB Banco Inter"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'transparent', color: 'var(--notion-text)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Type</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'var(--notion-bg)', color: 'var(--notion-text)' }}
                                    >
                                        {investmentTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Amount (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'transparent', color: 'var(--notion-text)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Rate / Return (Optional)</label>
                                <input
                                    placeholder="e.g. 100% CDI"
                                    value={rate}
                                    onChange={e => setRate(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'transparent', color: 'var(--notion-text)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'transparent', color: 'var(--notion-text)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Maturity Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={maturityDate}
                                        onChange={e => setMaturityDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--notion-border)', backgroundColor: 'transparent', color: 'var(--notion-text)' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--notion-text)', color: 'var(--notion-bg)', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                                {editingId ? 'Save Changes' : 'Add Investment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Investments;
