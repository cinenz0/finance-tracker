import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const { addToast } = useToast();
    const processedRecurringRef = useRef(false);

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

    // Initialize Budget Groups from LocalStorage
    const [budgetGroups, setBudgetGroups] = useState(() => {
        try {
            const stored = localStorage.getItem('finance_app_budget_groups');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load budget groups:', error);
            return [];
        }
    });

    // We don't need real loading state for local storage, but keeping it for compatibility
    const [loading, setLoading] = useState(false);

    // AUTOMATION LOGIC
    useEffect(() => {
        if (processedRecurringRef.current) return;

        const checkRecurringTransactions = () => {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const newTransactions = [];

            // Group by recurringId
            const recurringGroups = {};
            transactions.forEach(t => {
                if (t.isRecurring && t.recurringId) {
                    if (!recurringGroups[t.recurringId]) {
                        recurringGroups[t.recurringId] = [];
                    }
                    recurringGroups[t.recurringId].push(t);
                }
            });

            Object.values(recurringGroups).forEach(group => {
                // Sort by date descending
                group.sort((a, b) => new Date(b.date) - new Date(a.date));
                const latest = group[0];
                const latestDate = new Date(latest.date);

                // If latest transaction is from a previous month (or year)
                if (latestDate.getMonth() !== currentMonth || latestDate.getFullYear() !== currentYear) {
                    // Needs to recur
                    // Logic: If strict monthly, we just want to ensure we have one for THIS month
                    // We will create ONE for the current month.
                    // If missed multiple months? For now, just generate the current month to avoid spam.

                    const originalDay = parseInt(latest.date.split('-')[2]);

                    // CLAMPING LOGIC
                    // Get last day of current month
                    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    const targetDay = Math.min(originalDay, lastDayOfCurrentMonth);

                    const targetDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

                    const newTx = {
                        ...latest,
                        id: crypto.randomUUID(),
                        date: targetDateStr,
                        created_at: new Date().toISOString()
                    };

                    newTransactions.push(newTx);
                }
            });

            if (newTransactions.length > 0) {
                setTransactions(prev => [...newTransactions, ...prev]);
                addToast(`Auto-generated ${newTransactions.length} recurring transactions.`, 'info');
            }

            processedRecurringRef.current = true;
        };

        // Slight delay to ensure hydration if needed, but synchronous is fine for now
        checkRecurringTransactions();

    }, [transactions.length]); // Run once on mount (dep on length to trigger initial check, ref prevents loop)

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

    // Persist budgetGroups
    useEffect(() => {
        try {
            localStorage.setItem('finance_app_budget_groups', JSON.stringify(budgetGroups));
        } catch (error) {
            console.error('Failed to save budget groups:', error);
        }
    }, [budgetGroups]);

    const addTransaction = async (newTransaction) => {
        const transaction = {
            id: crypto.randomUUID(),
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            created_at: new Date().toISOString(),
            // Handle Recurring fields
            isRecurring: newTransaction.isRecurring || false,
            frequency: newTransaction.isRecurring ? 'monthly' : null,
            recurringId: newTransaction.isRecurring ? (newTransaction.recurringId || crypto.randomUUID()) : null
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

            const addBudgetGroup = (name, limit, color) => {
                const newGroup = { id: crypto.randomUUID(), name, limit: parseFloat(limit), color };
                setBudgetGroups(prev => [...prev, newGroup]);
                return newGroup;
            };

            const updateBudgetGroup = (id, updates) => {
                setBudgetGroups(prev => prev.map(g =>
                    g.id === id ? { ...g, ...updates, limit: updates.limit ? parseFloat(updates.limit) : g.limit } : g
                ));
            };

            const deleteBudgetGroup = (id) => {
                setBudgetGroups(prev => prev.filter(g => g.id !== id));
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
                importTransactions,
                budgetGroups,
                addBudgetGroup,
                updateBudgetGroup,
                deleteBudgetGroup
            };

            return (
                <FinanceContext.Provider value={value}>
                    {children}
                </FinanceContext.Provider>
            );
        };
