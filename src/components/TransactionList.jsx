import { useState, useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';
import { ChevronRight, ChevronDown, FileText, Calendar, Tag, DollarSign, Plus, Filter, ArrowUpDown, Trash2, Edit2 } from 'lucide-react';
import { iconMap } from './IconPicker';

const TagBadge = ({ tag }) => {
    const { tags, getTagColor } = useSettings();
    const tagDef = tags.find(t => t.name === tag);
    const color = getTagColor(tagDef ? tagDef.color : 'default');

    return (
        <span style={{
            backgroundColor: color.bg,
            color: color.text,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            lineHeight: '1.2',
            display: 'inline-block',
            marginRight: '4px'
        }}>
            {tag}
        </span>
    );
};

// Group Header Component
const GroupHeader = ({ month, count, expanded, onToggle }) => (
    <div
        onClick={onToggle}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 4px',
            cursor: 'pointer',
            color: 'var(--notion-text)',
            fontWeight: 600,
            fontSize: '14px',
            marginTop: '16px',
            userSelect: 'none'
        }}
    >
        <button style={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.4 }}></div>
            <span>{month}</span>
            <span style={{ color: 'var(--notion-text-gray)', fontWeight: 400, fontSize: '12px' }}>{count}</span>
        </div>
    </div>
);

const TransactionList = ({ title, transactions, onAdd, onEdit }) => {
    const { deleteTransaction } = useFinance();
    const { tags } = useSettings();
    const [filterPeriod, setFilterPeriod] = useState('All Months'); // Q1, Q2, Q3, Q4, All Months
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filterTags, setFilterTags] = useState([]); // Array of tag names
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});

    // Toggle logic
    const toggleGroup = (month) => {
        setExpandedGroups(prev => ({ ...prev, [month]: !prev[month] }));
    };

    const handleSortToggle = () => {
        setSortConfig(prev => {
            if (prev.key === 'date') return { key: 'amount', direction: 'desc' };
            if (prev.key === 'amount') return { key: 'date', direction: 'desc' };
            return { key: 'date', direction: 'desc' };
        });
    };

    const toggleTagFilter = (tagName) => {
        setFilterTags(prev =>
            prev.includes(tagName)
                ? prev.filter(t => t !== tagName)
                : [...prev, tagName]
        );
    };

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        let result = transactions;

        // 1. Filter by Period
        if (filterPeriod !== 'All Months') {
            result = result.filter(t => {
                const date = new Date(t.date);
                const month = date.getMonth(); // 0-11
                if (filterPeriod === 'Q1') return month >= 0 && month <= 2;
                if (filterPeriod === 'Q2') return month >= 3 && month <= 5;
                if (filterPeriod === 'Q3') return month >= 6 && month <= 8;
                if (filterPeriod === 'Q4') return month >= 9 && month <= 11;
                return true;
            });
        }

        // 2. Filter by Tags
        if (filterTags.length > 0) {
            result = result.filter(t => {
                // If transaction has no tags, and we are filtering, exclude it? 
                // Or if we select "No Tag"? For now, just match intersection.
                if (!t.tags || t.tags.length === 0) return false;
                return t.tags.some(tag => filterTags.includes(tag));
            });
        }

        return result;
    }, [transactions, filterPeriod, filterTags]);

    // Sort & Group Logic
    const grouped = useMemo(() => {
        // 1. Sort the filtered list first
        const sorted = [...filteredTransactions].sort((a, b) => {
            if (sortConfig.key === 'date') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortConfig.key === 'amount') {
                return b.amount - a.amount;
            }
            return 0;
        });

        // 2. Group
        const groups = sorted.reduce((acc, t) => {
            // Fix timezone issue by treating date string explicitly
            const parts = t.date.split('-'); // YYYY-MM-DD
            const date = new Date(parts[0], parts[1] - 1, parts[2]); // YYYY, MM (0-indexed), DD
            const monthKey = date.toLocaleString('default', { month: 'long' });

            if (!acc[monthKey]) acc[monthKey] = [];
            acc[monthKey].push(t);
            return acc;
        }, {});

        return groups;
    }, [filteredTransactions, sortConfig]);

    // Get months in correct order (chronological for date sort, or just list order otherwise)
    // Actually, if we sort by Amount, the monthly grouping might feel weird, but Notion keeps groups.
    // Let's rely on the natural order of keys if possible, or force chronological month order.
    // For now, let's just take keys, which usually preserves insertion order in V8 (roughly).
    // Better: Sort the months based on the first transaction in each group?
    const months = Object.keys(grouped);

    // Auto-expand first group if it exists and nothing is set
    useMemo(() => {
        if (months.length > 0 && Object.keys(expandedGroups).length === 0) {
            setExpandedGroups({ [months[0]]: true });
        }
    }, [months]);


    return (
        <div style={{ marginBottom: '48px' }}>
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        {title.includes('Income') ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '4px solid #59b98c' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '4px solid #ea6b6b' }} />}
                        {title}
                    </h2>
                    <button
                        onClick={onAdd}
                        style={{ background: 'var(--notion-hover)', color: 'var(--notion-text)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--notion-border)'}
                        onMouseLeave={(e) => e.target.style.background = 'var(--notion-hover)'}
                    >
                        <Plus size={14} /> New
                    </button>
                </div>

                {/* Tabs / Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--notion-border)', paddingBottom: '8px', fontSize: '14px', color: 'var(--notion-text-gray)' }}>
                    {['All Months', 'Q1', 'Q2', 'Q3', 'Q4'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setFilterPeriod(tab)}
                            style={{
                                cursor: 'pointer',
                                color: filterPeriod === tab ? 'var(--notion-text)' : 'inherit',
                                fontWeight: filterPeriod === tab ? 500 : 400,
                                borderBottom: filterPeriod === tab ? '2px solid var(--notion-text)' : 'none',
                                paddingBottom: '8px',
                                marginBottom: '-9px'
                            }}
                        >
                            {tab === 'All Months' ? <><span style={{ marginRight: 4 }}>▦</span>All Months</> : <><span style={{ marginRight: 4 }}>◫</span>{tab}</>}
                        </div>
                    ))}
                    <div style={{ flex: 1 }}></div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={handleSortToggle}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: sortConfig.key !== 'date' ? 'var(--notion-text)' : 'inherit' }}
                            title={`Sorted by ${sortConfig.key}`}
                        >
                            <ArrowUpDown size={14} />
                            {sortConfig.key === 'amount' && <span style={{ fontSize: '10px' }}>Amt</span>}
                        </button>

                        {/* Tag Filter Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                    color: filterTags.length > 0 ? 'var(--notion-text)' : 'inherit',
                                    background: filterTags.length > 0 ? 'var(--notion-hover)' : 'transparent',
                                    padding: '2px 4px', borderRadius: '4px'
                                }}
                            >
                                <Filter size={14} />
                                {filterTags.length > 0 && <span style={{ fontSize: '10px', fontWeight: 600 }}>{filterTags.length}</span>}
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => setIsFilterOpen(false)} />
                                    <div style={{
                                        position: 'absolute', right: 0, top: '24px', zIndex: 100,
                                        background: 'var(--notion-bg)', border: '1px solid var(--notion-border)',
                                        borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        width: '200px', padding: '8px', maxHeight: '300px', overflowY: 'auto'
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: 600, paddingBottom: '4px', color: 'var(--notion-text-gray)', borderBottom: '1px solid var(--notion-border)', marginBottom: '4px' }}>
                                            Filter by Tag
                                        </div>
                                        {tags.map(tag => (
                                            <div
                                                key={tag.name}
                                                onClick={() => toggleTagFilter(tag.name)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '4px',
                                                    cursor: 'pointer', fontSize: '13px', borderRadius: '3px',
                                                    backgroundColor: filterTags.includes(tag.name) ? 'var(--notion-hover)' : 'transparent'
                                                }}
                                                className="hover-bg-item"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filterTags.includes(tag.name)}
                                                    readOnly
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span style={{
                                                    width: 8, height: 8, borderRadius: '50%', backgroundColor: tag.color === 'default' ? '#e3e2e0' : {
                                                        gray: '#e3e2e0', brown: '#eee0da', orange: '#fadec9',
                                                        yellow: '#fdecc8', green: '#dbeddb', blue: '#d3e5ef',
                                                        purple: '#e8deee', pink: '#f5e0e9', red: '#ffe2dd'
                                                    }[tag.color] || '#e3e2e0'
                                                }}></span>
                                                {tag.name}
                                            </div>
                                        ))}
                                        {tags.length === 0 && <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)', padding: '8px' }}>No tags available</div>}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 40px', padding: '8px 4px', fontSize: '12px', color: 'var(--notion-text-gray)', borderBottom: '1px solid var(--notion-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={12} /> Source</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={12} /> Amount</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> Tags</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Date</div>
                <div></div>
            </div>

            {/* Content */}
            <div>
                {months.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--notion-text-gray)', fontSize: '13px' }}>No transactions found for this period</div>
                )}

                {months.map(month => (
                    <div key={month}>
                        <GroupHeader
                            month={month}
                            count={grouped[month].length}
                            expanded={expandedGroups[month]}
                            onToggle={() => toggleGroup(month)}
                        />
                        {expandedGroups[month] && (
                            <div>
                                {grouped[month].map(t => (
                                    <div key={t.id} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1.5fr 1fr 40px',
                                        padding: '8px 4px',
                                        borderBottom: '1px solid var(--notion-border)',
                                        fontSize: '14px',
                                        alignItems: 'center'
                                    }} className="hover-row">
                                        <style>{`
                                            .hover-row:hover { background-color: var(--notion-hover); }
                                            .hover-row .delete-btn { opacity: 0; }
                                            .hover-row:hover .delete-btn { opacity: 1; }
                                        `}</style>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                            {(() => {
                                                const IconComponent = iconMap[t.icon] || FileText;
                                                return <IconComponent size={14} style={{ opacity: 0.5 }} />;
                                            })()}
                                            {t.source}
                                        </div>
                                        <div style={{ fontFamily: 'monospace' }}>R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {t.tags && t.tags.length > 0 ? (
                                                t.tags.map(tag => <TagBadge key={tag} tag={tag} />)
                                            ) : <span style={{ opacity: 0.3 }}>-</span>}
                                        </div>
                                        <div style={{ color: 'var(--notion-text-gray)' }}>
                                            {new Date(t.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(t);
                                                }}
                                                style={{
                                                    border: 'none', background: 'transparent',
                                                    color: 'var(--notion-text-gray)', cursor: 'pointer',
                                                    transition: 'opacity 0.2s', margin: '0 4px'
                                                }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Delete this transaction?')) {
                                                        deleteTransaction(t.id);
                                                    }
                                                }}
                                                style={{
                                                    border: 'none', background: 'transparent',
                                                    color: 'var(--notion-text-gray)', cursor: 'pointer',
                                                    transition: 'opacity 0.2s'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* New Item Placeholder */}
                                <div
                                    onClick={onAdd}
                                    style={{
                                        padding: '8px 4px', fontSize: '14px',
                                        color: 'var(--notion-text-gray)',
                                        borderBottom: '1px solid var(--notion-border)',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    <Plus size={14} /> New
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionList;
