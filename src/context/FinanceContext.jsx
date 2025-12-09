import { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    // Initialize transactions from LocalStorage
    const [transactions, setTransactions] = useState(() => {
        try {
            const stored = localStorage.getItem('finance_app_transactions');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load transactions:', error);
            return [];
        }
    });

    // Initialize investments from LocalStorage
    const [investments, setInvestments] = useState(() => {
        try {
            const stored = localStorage.getItem('finance_app_investments');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load investments:', error);
            return [];
        }
    });

    // We don't need real loading state for local storage, but keeping it for compatibility
    const [loading, setLoading] = useState(false);

    // Persist to LocalStorage whenever transactions change
    useEffect(() => {
        try {
            localStorage.setItem('finance_app_transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
    }, [transactions]);

    // Persist investments
    useEffect(() => {
        try {
            localStorage.setItem('finance_app_investments', JSON.stringify(investments));
        } catch (error) {
            console.error('Failed to save investments:', error);
        }
    }, [investments]);

    const addTransaction = async (newTransaction) => {
        const transaction = {
            id: crypto.randomUUID(),
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            created_at: new Date().toISOString()
        };
        setTransactions(prev => [transaction, ...prev]);
        return Promise.resolve(transaction);
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateTransaction = async (updatedTransaction) => {
        setTransactions(prev => prev.map(t =>
            t.id === updatedTransaction.id ? { ...t, ...updatedTransaction } : t
        ));
        return Promise.resolve(updatedTransaction);
    };

    const addInvestment = async (newInvestment) => {
        const investment = {
            id: crypto.randomUUID(),
            ...newInvestment,
            amount: parseFloat(newInvestment.amount),
            created_at: new Date().toISOString()
        };
        setInvestments(prev => [investment, ...prev]);
        return Promise.resolve(investment);
    };

    const deleteInvestment = (id) => {
        setInvestments(prev => prev.filter(i => i.id !== id));
    };

    const updateInvestment = async (updated) => {
        setInvestments(prev => prev.map(i =>
            i.id === updated.id ? { ...i, ...updated } : i
        ));
        return Promise.resolve(updated);
    };

    // --- Derived Data Calculations (Same as before) ---

    const calculateSavingsData = () => {
        const byMonth = transactions.reduce((acc, t) => {
            const d = new Date(t.date);
            const key = d.toLocaleString('default', { month: 'short' });
            if (!acc[key]) acc[key] = 0;
            if (t.type === 'income') acc[key] += t.amount;
            else acc[key] -= t.amount;
            return acc;
        }, {});

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map(m => {
            const net = byMonth[m] || 0;
            return { month: m, amount: net };
        });
    };

    const calculateBreakdown = (type) => {
        const data = transactions
            .filter(t => t.type === type)
            .reduce((acc, t) => {
                const category = t.tags && t.tags[0] ? t.tags[0] : 'Uncategorized';
                if (!acc[category]) acc[category] = 0;
                acc[category] += t.amount;
                return acc;
            }, {});

        return Object.entries(data).map(([name, value], index) => ({
            name,
            value,
            color: type === 'income'
                ? ['#59b98c', '#97d6b9'][index % 2]
                : ['#ea6b6b', '#f19e9e', '#f5c6c6', '#f9e0e0'][index % 4]
        }));
    };

    const calculateSummaries = () => {
        const grouped = transactions.reduce((acc, t) => {
            const d = new Date(t.date);
            const key = d.toLocaleString('default', { month: 'long' });
            const id = key.toLowerCase();

            if (!acc[id]) acc[id] = { id, name: key, income: 0, expenses: 0, net: 0 };

            if (t.type === 'income') acc[id].income += t.amount;
            else acc[id].expenses += t.amount;

            acc[id].net = acc[id].income - acc[id].expenses;
            return acc;
        }, {});

        return Object.values(grouped);
    };

    const calculatePortfolioBreakdown = () => {
        const data = investments.reduce((acc, item) => {
            const type = item.type || 'Other';
            if (!acc[type]) acc[type] = 0;
            acc[type] += item.amount;
            return acc;
        }, {});

        return Object.entries(data).map(([name, value]) => ({
            name,
            value
        }));
    };

    const KEYWORD_MAP = {
        'Transporte': ['uber', '99', 'gas', 'parking', 'estacionamento', 'combustivel', 'posto'],
        'Alimentação': ['ifood', 'rappi', 'market', 'restaurant', 'burger', 'mcdonalds', 'kfc', 'padaria', 'supermercado'],
        'Lazer': ['netflix', 'steam', 'spotify', 'cinema', 'hbomax', 'amazon prime', 'disney'],
        'Investimentos': ['brokerage', 'b3', 'treasury', 'corretora', 'nubank', 'inter', 'nuinvest'],
        'Salario': ['salary', 'payment', 'remuneration', 'pagamento', 'salário']
    };

    const importTransactions = (csvContent) => {
        const lines = csvContent.split('\n');
        let incomeCount = 0;
        let expenseCount = 0;
        const newTransactions = [];

        // Simple detection of headers to skip first line if needed
        const startIndex = lines[0].toLowerCase().includes('date') || lines[0].toLowerCase().includes('description') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(','); // Assumes standard CSV
            if (parts.length < 2) continue;

            // Heuristic: Amount is usually the last or close to last column containing digits
            // Description is usually the longest string or the one before amount
            // For MVP, lets assume format: Date, Description, Amount OR Description, Amount

            let description = '';
            let rawAmount = '';

            if (parts.length === 2) {
                description = parts[0];
                rawAmount = parts[1];
            } else if (parts.length >= 3) {
                // Try to find the amount column (last numeric-ish column)
                rawAmount = parts[parts.length - 1];
                description = parts[1]; // Often 2nd column in bank exports (Date, Desc, Val)
            }

            // Cleanup description
            description = description.replace(/"/g, '').trim();

            // Robust BRL Parsing
            // 1. Remove R$, whitespace, and other non-numeric chars except . , -
            // 2. Identify millesimal vs decimal separator
            // Brazilian format: 1.000,00 -> Remove dots, replace comma with dot

            let cleanAmountStr = rawAmount.replace(/[R$\s"]/g, '');
            // Check if it's Brazilian format (has comma as decimal separator)
            if (cleanAmountStr.includes(',') && !cleanAmountStr.includes('.')) {
                cleanAmountStr = cleanAmountStr.replace(',', '.');
            } else if (cleanAmountStr.includes('.') && cleanAmountStr.includes(',')) {
                // Mixed 1.000,00 structure
                cleanAmountStr = cleanAmountStr.replace(/\./g, '').replace(',', '.');
            }

            const amount = parseFloat(cleanAmountStr);

            if (isNaN(amount)) continue;

            // Auto-Tagging
            let assignedTag = null;
            const lowerDesc = description.toLowerCase();
            for (const [tag, keywords] of Object.entries(KEYWORD_MAP)) {
                if (keywords.some(k => lowerDesc.includes(k))) {
                    assignedTag = tag;
                    break;
                }
            }

            const transaction = {
                id: crypto.randomUUID(),
                description: description || 'Imported Transaction',
                amount: Math.abs(amount),
                type: amount >= 0 ? 'income' : 'expense',
                date: new Date().toISOString().split('T')[0], // Default to today for now
                tags: assignedTag ? [assignedTag] : []
            };

            if (transaction.type === 'income') incomeCount++;
            else expenseCount++;

            newTransactions.push(transaction);
        }

        if (newTransactions.length > 0) {
            setTransactions(prev => [...newTransactions, ...prev]);
        }

        return { success: true, count: newTransactions.length, income: incomeCount, expense: expenseCount };
    };

    const value = {
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        loading,
        savingsData: calculateSavingsData(),
        incomeBreakdown: calculateBreakdown('income'),
        expensesBreakdown: calculateBreakdown('expense'),
        monthlySummaries: calculateSummaries(),
        investments,
        addInvestment,
        deleteInvestment,
        updateInvestment,
        portfolioBreakdown: calculatePortfolioBreakdown(),
        importTransactions
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
