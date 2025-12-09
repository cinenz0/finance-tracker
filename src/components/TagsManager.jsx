import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';
import { Tag, Edit2, Trash2, Plus, Check, X } from 'lucide-react';

const TagsManager = () => {
    const { tags, addTag, updateTag, deleteTag, getTagColor } = useSettings();
    const { budgetGroups, addBudgetGroup, updateBudgetGroup, deleteBudgetGroup } = useFinance();

    // Styles
    const inputStyle = { padding: '6px', border: '1px solid var(--notion-border)', borderRadius: '4px', background: 'var(--notion-bg)', color: 'var(--notion-text)', fontSize: '14px' };
    const colorInputStyle = { border: 'none', width: '30px', height: '30px', padding: 0, background: 'transparent', cursor: 'pointer' };
    const actionButtonStyle = { padding: '6px', background: 'var(--notion-text)', color: 'var(--notion-bg)', border: 'none', borderRadius: '4px', cursor: 'pointer' };
    const cancelButtonStyle = { padding: '6px', background: 'transparent', color: 'var(--notion-text-gray)', border: 'none', borderRadius: '4px', cursor: 'pointer' };
    const iconButtonStyle = { padding: '6px', background: 'transparent', border: 'none', color: 'var(--notion-text-gray)', cursor: 'pointer' };
    const itemContainerStyle = { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '1px solid var(--notion-border)', borderRadius: '4px', backgroundColor: 'var(--notion-bg)' };

    // Tags State
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editGroupId, setEditGroupId] = useState(''); // New: Assign Group
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#2383e2');
    const [newGroupId, setNewGroupId] = useState(''); // New: Assign Group

    // Groups State
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupLimit, setNewGroupLimit] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#2383e2');
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupLimit, setEditGroupLimit] = useState('');
    const [editGroupColor, setEditGroupColor] = useState('');

    const startEditing = (tag) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
        setEditGroupId(tag.groupId || '');
    };

    const saveEdit = (id) => {
        updateTag(id, { name: editName, color: editColor, groupId: editGroupId || null });
        setEditingId(null);
    };

    const handleCreate = () => {
        if (newName.trim()) {
            addTag(newName, newColor, newGroupId || null);
            setNewName('');
            setNewColor('#2383e2');
            setNewGroupId('');
            setIsCreating(false);
        }
    };

    const handleCreateGroup = () => {
        if (newGroupName.trim() && newGroupLimit) {
            addBudgetGroup(newGroupName, newGroupLimit, newGroupColor);
            setNewGroupName('');
            setNewGroupLimit('');
            setNewGroupColor('#2383e2');
            setIsCreatingGroup(false);
        }
    };

    const startEditingGroup = (group) => {
        setEditingGroupId(group.id);
        setEditGroupName(group.name);
        setEditGroupLimit(group.limit);
        setEditGroupColor(group.color);
    };

    const saveEditGroup = (id) => {
        updateBudgetGroup(id, { name: editGroupName, limit: editGroupLimit, color: editGroupColor });
        setEditingGroupId(null);
    };

    return (
        <div style={{ padding: '32px 48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px', borderRadius: '4px',
                        backgroundColor: 'var(--notion-hover)', color: 'var(--notion-text)',
                        marginBottom: '16px'
                    }}>
                        <Tag size={20} />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Tags</h1>
                    <p style={{ color: 'var(--notion-text-gray)', marginTop: '8px' }}>Manage your transaction tags.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        background: '#2383e2', color: 'white', border: 'none', borderRadius: '4px',
                        padding: '6px 12px', fontSize: '14px', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                    }}
                >
                    <Plus size={16} /> New Tag
                </button>
            </div>

            {/* Create New Inline */}
            {isCreating && (
                <div style={{
                    border: '1px solid #2383e2', borderRadius: '4px', padding: '12px',
                    marginBottom: '24px', backgroundColor: 'var(--notion-bg)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Tag Name"
                        autoFocus
                        style={{ flex: 1, padding: '6px', border: '1px solid var(--notion-border)', borderRadius: '4px', background: 'var(--notion-bg)', color: 'var(--notion-text)' }}
                    />
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        style={{ border: 'none', width: '32px', height: '32px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                    />
                    <button onClick={handleCreate} style={{ padding: '6px', background: '#2383e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={16} /></button>
                    <button onClick={() => setIsCreating(false)} style={{ padding: '6px', background: 'transparent', color: 'var(--notion-text-gray)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
            )}

            {/* --- BUDGET GROUPS SECTION --- */}
            <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--notion-border)', paddingBottom: '32px' }}>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Budget Groups</h2>
                        <p style={{ color: 'var(--notion-text-gray)', fontSize: '14px', marginTop: '4px' }}>Associate tags with groups to track budget limits.</p>
                    </div>
                    <button
                        onClick={() => setIsCreatingGroup(true)}
                        style={{
                            background: 'var(--notion-bg)', border: '1px solid var(--notion-border)', borderRadius: '4px',
                            padding: '6px 12px', fontSize: '14px', fontWeight: 500,
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                            color: 'var(--notion-text)'
                        }}
                    >
                        <Plus size={16} /> New Group
                    </button>
                </div>

                {/* Create Group Inline */}
                {isCreatingGroup && (
                    <div style={{
                        border: '1px solid var(--notion-border)', borderRadius: '4px', padding: '12px',
                        marginBottom: '16px', backgroundColor: 'var(--notion-hover)',
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group Name" autoFocus style={inputStyle} />
                        <input type="number" value={newGroupLimit} onChange={(e) => setNewGroupLimit(e.target.value)} placeholder="Limit ($)" style={inputStyle} />
                        <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} style={colorInputStyle} />
                        <button onClick={handleCreateGroup} style={actionButtonStyle}><Check size={16} /></button>
                        <button onClick={() => setIsCreatingGroup(false)} style={cancelButtonStyle}><X size={16} /></button>
                    </div>
                )}

                {/* Groups List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {budgetGroups.map(group => (
                        <div key={group.id} style={itemContainerStyle}>
                            {editingGroupId === group.id ? (
                                <>
                                    <input value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} style={inputStyle} />
                                    <input type="number" value={editGroupLimit} onChange={(e) => setEditGroupLimit(e.target.value)} style={inputStyle} />
                                    <input type="color" value={editGroupColor} onChange={(e) => setEditGroupColor(e.target.value)} style={colorInputStyle} />
                                    <button onClick={() => saveEditGroup(group.id)} style={actionButtonStyle}><Check size={16} /></button>
                                    <button onClick={() => setEditingGroupId(null)} style={cancelButtonStyle}><X size={16} /></button>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: group.color }}></div>
                                    <span style={{ flex: 1, fontWeight: 600 }}>{group.name}</span>
                                    <span style={{ marginRight: '16px', fontSize: '14px', color: 'var(--notion-text-gray)' }}>
                                        Limit: R$ {group.limit.toLocaleString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={() => startEditingGroup(group)} style={iconButtonStyle}><Edit2 size={16} /></button>
                                        <button onClick={() => { if (window.confirm('Delete group? Tags will become uncategorized.')) deleteBudgetGroup(group.id); }} style={iconButtonStyle}><Trash2 size={16} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {budgetGroups.length === 0 && <div style={{ color: 'var(--notion-text-gray)', fontStyle: 'italic' }}>No budget groups created.</div>}
                </div>
            </div>

            {/* --- TAGS SECTION --- */}
            <div>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>All Tags</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            background: '#2383e2', color: 'white', border: 'none', borderRadius: '4px',
                            padding: '6px 12px', fontSize: '14px', fontWeight: 500,
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                        }}
                    >
                        <Plus size={16} /> New Tag
                    </button>
                </div>
            </div>

            {/* Create New Tag Inline */}
            {isCreating && (
                <div style={{
                    border: '1px solid #2383e2', borderRadius: '4px', padding: '12px',
                    marginBottom: '24px', backgroundColor: 'var(--notion-bg)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Tag Name"
                        autoFocus
                        style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                        value={newGroupId}
                        onChange={(e) => setNewGroupId(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">No Group</option>
                        {budgetGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        style={colorInputStyle}
                    />
                    <button onClick={handleCreate} style={actionButtonStyle}><Check size={16} /></button>
                    <button onClick={() => setIsCreating(false)} style={cancelButtonStyle}><X size={16} /></button>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tags.map(tag => (
                    <div key={tag.id} style={itemContainerStyle}>
                        {editingId === tag.id ? (
                            <>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <select
                                    value={editGroupId}
                                    onChange={(e) => setEditGroupId(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">No Group</option>
                                    {budgetGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <input
                                    type="color"
                                    value={editColor.startsWith('#') ? editColor : getTagColor(editColor).bg}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    style={colorInputStyle}
                                />
                                <button onClick={() => saveEdit(tag.id)} style={actionButtonStyle}><Check size={16} /></button>
                                <button onClick={() => setEditingId(null)} style={cancelButtonStyle}><X size={16} /></button>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    backgroundColor: getTagColor(tag.color).bg,
                                    border: '1px solid var(--notion-border)'
                                }}></div>
                                <span style={{ flex: 1, fontWeight: 500 }}>{tag.name}</span>

                                {/* Group Badge */}
                                {tag.groupId && (
                                    <span style={{
                                        fontSize: '12px', padding: '2px 8px', borderRadius: '12px',
                                        backgroundColor: budgetGroups.find(g => g.id === tag.groupId)?.color + '33' || '#eee',
                                        color: 'var(--notion-text-gray)', marginRight: '12px'
                                    }}>
                                        {budgetGroups.find(g => g.id === tag.groupId)?.name || 'Unknown Group'}
                                    </span>
                                )}

                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => startEditing(tag)}
                                        style={iconButtonStyle}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Delete tag "${tag.name}"?`)) deleteTag(tag.id);
                                        }}
                                        style={iconButtonStyle}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagsManager;
