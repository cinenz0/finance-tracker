import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';
import AddTransactionModal from './AddTransactionModal';
import TransactionList from './TransactionList';

const Expenses = () => {
    const { transactions } = useFinance();
    const { accountName } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleOpenModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '32px 48px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType="expense"
                transactionToEdit={editingTransaction}
            />

            {/* Header */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'black', borderRadius: '50%', color: 'white' }}>
                            <span style={{ transform: 'rotate(90deg)', fontSize: '20px' }}>➜</span>
                        </span>
                        Expenses
                    </h1>
                </div>
            </div>

            {/* Reused List Component */}
            <TransactionList
                title="All Expenses"
                transactions={transactions.filter(t => t.type === 'expense')}
                onAdd={handleOpenModal}
                onEdit={handleOpenEditModal}
            />
        </div>
    );
};

export default Expenses;
