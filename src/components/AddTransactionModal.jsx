import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X } from 'lucide-react';
import IconPicker from './IconPicker';
import TagSelector from './TagSelector';

const AddTransactionModal = ({ isOpen, onClose, initialType = 'expense', transactionToEdit = null }) => {
    const { addTransaction, updateTransaction } = useFinance();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: initialType,
        tags: [],
        icon: 'file-text',
        isRecurring: false
    });

    useEffect(() => {
        if (isOpen) {
            if (transactionToEdit && formData.id !== transactionToEdit.id) {
                setFormData({
                    id: transactionToEdit.id,
                    source: transactionToEdit.source,
                    amount: transactionToEdit.amount,
                    date: transactionToEdit.date,
                    type: transactionToEdit.type,
                    tags: transactionToEdit.tags || [],
                    icon: transactionToEdit.icon || 'file-text',
                    isRecurring: transactionToEdit.isRecurring || false,
                    recurringId: transactionToEdit.recurringId
                });
            } else if (!transactionToEdit && formData.id) {
                // Wiping if switching from edit to add
                setFormData({ source: '', amount: '', date: new Date().toISOString().split('T')[0], type: initialType, tags: [], icon: 'file-text', isRecurring: false });
            } else if (!transactionToEdit && formData.type !== initialType && formData.source === '') {
                setFormData(prev => ({ ...prev, type: initialType }));
            }
        }
    }, [isOpen, transactionToEdit, initialType]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (transactionToEdit) {
                await updateTransaction({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    tags: formData.tags
                });
            } else {
                await addTransaction({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    tags: formData.tags
                });
            }
            onClose();
            setFormData({ source: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'expense', tags: [], icon: 'file-text', isRecurring: false });
        } catch (error) {
            console.error(error);
            alert('Failed to save transaction: ' + (error.message || JSON.stringify(error)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--notion-bg)',
                color: 'var(--notion-text)',
                padding: '24px', borderRadius: '4px',
                width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                position: 'relative',
                border: '1px solid var(--notion-border)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--notion-text-gray)' }}>
                    <X size={20} />
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>{transactionToEdit ? 'Edit Transaction' : 'New Transaction'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Icon Selection */}
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)', marginBottom: '4px' }}>Icon</div>
                        <IconPicker
                            selectedIcon={formData.icon}
                            onSelect={(icon) => setFormData({ ...formData, icon })}
                        />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <input
                            placeholder="Source (e.g. Starbucks)"
                            required
                            value={formData.source}
                            onChange={e => setFormData({ ...formData, source: e.target.value })}
                            style={{
                                width: '100%', padding: '8px',
                                border: '1px solid var(--notion-border)', borderRadius: '4px',
                                background: 'var(--notion-bg)', color: 'var(--notion-text)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 1 }}>
                        <input
                            type="number" step="0.01" placeholder="Amount"
                            required
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            style={{
                                flex: 1, padding: '8px',
                                border: '1px solid var(--notion-border)', borderRadius: '4px',
                                background: 'var(--notion-bg)', color: 'var(--notion-text)'
                            }}
                        />
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            style={{
                                padding: '8px', border: '1px solid var(--notion-border)', borderRadius: '4px',
                                background: 'var(--notion-bg)', color: 'var(--notion-text)'
                            }}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            style={{
                                width: '100%', padding: '8px',
                                border: '1px solid var(--notion-border)', borderRadius: '4px',
                                background: 'var(--notion-bg)', color: 'var(--notion-text)'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative', zIndex: 20 }}>
                        <TagSelector
                            selectedTags={formData.tags}
                            onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                        <input
                            type="checkbox"
                            checked={formData.isRecurring || false}
                            onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                            style={{ cursor: 'pointer' }}
                            id="recurring-toggle"
                        />
                        <label htmlFor="recurring-toggle" style={{ fontSize: '13px', color: 'var(--notion-text)', cursor: 'pointer' }}>
                            Repeat Monthly
                        </label>
                    </div>

                    <button
                        disabled={loading}
                        style={{
                            marginTop: '8px', padding: '8px', background: 'var(--button-bg)',
                            color: 'var(--button-text)', borderRadius: '4px', fontWeight: 500,
                            position: 'relative', zIndex: 1
                        }}
                    >
                        {loading ? 'Saving...' : (transactionToEdit ? 'Save Changes' : 'Add Transaction')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
