import { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { Command, ArrowRight, Tag, Wallet } from 'lucide-react';

const CommandBar = () => {
    const { addTransaction } = useFinance();
    const { tags, getTagColor } = useSettings();
    const { showToast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    // --- Keyboard Shortcut ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // --- Parser Logic ---
    const parseInput = (text) => {
        if (!text) return null;

        let cleanText = text;
        const result = {
            amount: 0,
            type: 'expense',
            tag: null,
            description: '',
            date: new Date().toISOString().split('T')[0]
        };

        // 1. Parse Amount (Brazilian support: 50,00 or 50.00)
        // Look for number at start or isolated
        const amountMatch = cleanText.match(/(\d+([.,]\d{1,2})?)/);
        if (amountMatch) {
            let valStr = amountMatch[0].replace(',', '.');
            result.amount = parseFloat(valStr);
            // Remove amount from text to avoid confusion in desc
            cleanText = cleanText.replace(amountMatch[0], '').trim();
        }

        // 2. Detect Type (Keywords)
        const incomeKeywords = ['income', 'deposit', 'salary', 'receita', 'deposito', '+'];
        const isIncome = incomeKeywords.some(k => cleanText.toLowerCase().includes(k));
        result.type = isIncome ? 'income' : 'expense';
        // Remove keywords like '+' from description if standalone
        if (cleanText.startsWith('+ ')) cleanText = cleanText.substring(2);

        // 3. Match Tags (Word Boundary)
        // Sort tags by length desc to match longer tags first (e.g. "Food Delivery" before "Food")
        const sortedTags = [...tags].sort((a, b) => b.name.length - a.name.length);

        for (const tag of sortedTags) {
            // Escape special regex chars in tag name
            const escapedName = tag.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedName}\\b`, 'i');

            if (regex.test(cleanText)) {
                result.tag = tag;
                // Ideally we remove the tag from description, but sometimes it makes sense to keep context.
                // For cleanlyness, let's remove it if it's exact match
                cleanText = cleanText.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
                break; // Only one tag for now
            }
        }

        // 4. Description is what's left
        // Capitalize first letter
        result.description = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        if (!result.description && result.tag) result.description = result.tag.name;
        if (!result.description) result.description = 'Quick Transaction';

        return result;
    };

    const parsed = parseInput(input);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!parsed || !parsed.amount) return;

        const newTx = {
            id: crypto.randomUUID(),
            description: parsed.description,
            amount: parsed.amount,
            type: parsed.type,
            date: parsed.date,
            tags: parsed.tag ? [parsed.tag.id] : []
        };

        addTransaction(newTx);
        showToast(`Added: ${parsed.description} - R$ ${parsed.amount.toFixed(2)}`, 'success');

        setInput('');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '20vh', backdropFilter: 'blur(2px)'
        }} onClick={() => setIsOpen(false)}>
            <div
                style={{
                    width: '600px', maxWidth: '90%',
                    backgroundColor: 'var(--notion-bg)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    border: '1px solid var(--notion-border)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Command size={24} color="var(--notion-text-gray)" />
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type to add... (e.g. '50 Lunch iFood')"
                            style={{
                                flex: 1, fontSize: '24px', background: 'transparent',
                                border: 'none', color: 'var(--notion-text)', outline: 'none',
                                fontWeight: 500
                            }}
                        />
                    </div>
                </form>

                {/* Live Preview */}
                {input && parsed && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--notion-hover)',
                        borderTop: '1px solid var(--notion-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            {/* Amount */}
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--notion-text-gray)', textTransform: 'uppercase', fontWeight: 600 }}>Amount</div>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: parsed.type === 'income' ? '#59b98c' : '#ea6b6b' }}>
                                    {parsed.type === 'income' ? '+' : '-'} R$ {parsed.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            {/* Tag */}
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--notion-text-gray)', textTransform: 'uppercase', fontWeight: 600 }}>Tag</div>
                                {parsed.tag ? (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        backgroundColor: getTagColor(parsed.tag.color).bg,
                                        padding: '2px 8px', borderRadius: '4px', marginTop: '2px',
                                        fontSize: '14px', fontWeight: 500
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: parsed.tag.color }}></div>
                                        {parsed.tag.name}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '14px', color: 'var(--notion-text-gray)', fontStyle: 'italic', marginTop: '2px' }}>Uncategorized</div>
                                )}
                            </div>

                            {/* Description */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: 'var(--notion-text-gray)', textTransform: 'uppercase', fontWeight: 600 }}>Description</div>
                                <div style={{ fontSize: '16px', color: 'var(--notion-text)', marginTop: '2px' }}>
                                    {parsed.description}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            style={{
                                background: 'var(--notion-text)', color: 'var(--notion-bg)',
                                border: 'none', borderRadius: '4px', padding: '8px 16px',
                                cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            Add <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {!input && (
                    <div style={{ padding: '12px 16px', color: 'var(--notion-text-gray)', fontSize: '13px', display: 'flex', gap: '16px' }}>
                        <span>Try: <code style={{ background: 'rgba(128,128,128,0.2)', padding: '2px 4px', borderRadius: '3px' }}>50 Coffee</code></span>
                        <span><code style={{ background: 'rgba(128,128,128,0.2)', padding: '2px 4px', borderRadius: '3px' }}>+ 3000 Salary</code></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandBar;
