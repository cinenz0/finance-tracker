import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';
import { Tag, Edit2, Trash2, Plus, Check, X, Folder, FolderOpen } from 'lucide-react';

const TagsManager = () => {
    const { tags, addTag, updateTag, deleteTag, getTagColor } = useSettings();
    const { budgetGroups, addBudgetGroup, updateBudgetGroup, deleteBudgetGroup } = useFinance();

    // Styles
    const inputStyle = { padding: '6px', border: '1px solid var(--notion-border)', borderRadius: '4px', background: 'var(--notion-bg)', color: 'var(--notion-text)', fontSize: '14px' };
    const colorInputStyle = { border: 'none', width: '30px', height: '30px', padding: 0, background: 'transparent', cursor: 'pointer' };
    const actionButtonStyle = { padding: '6px', background: 'var(--notion-text)', color: 'var(--notion-bg)', border: 'none', borderRadius: '4px', cursor: 'pointer' };
    const cancelButtonStyle = { padding: '6px', background: 'transparent', color: 'var(--notion-text-gray)', border: 'none', borderRadius: '4px', cursor: 'pointer' };
    const iconButtonStyle = { padding: '6px', background: 'transparent', border: 'none', color: 'var(--notion-text-gray)', cursor: 'pointer' };
    const groupCardStyle = {
        border: '1px solid var(--notion-border)', borderRadius: '8px',
        marginBottom: '24px', overflow: 'hidden', background: 'var(--notion-bg)'
    };
    const groupHeaderStyle = {
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--notion-border)', background: 'var(--notion-hover)'
    };
    const groupBodyStyle = { padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' };

    // Tag State
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editGroupId, setEditGroupId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#2383e2');
    const [newGroupId, setNewGroupId] = useState('');

    // Group State
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupLimit, setNewGroupLimit] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#2383e2');
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupLimit, setEditGroupLimit] = useState('');
    const [editGroupColor, setEditGroupColor] = useState('');

    // --- Actions ---

    const handleDeleteGroup = (groupId) => {
        if (!window.confirm('Delete this budget group? Tags will be moved to "Uncategorized".')) return;

        // 1. Cleanup tags
        const tagsInGroup = tags.filter(t => t.groupId === groupId);
        tagsInGroup.forEach(t => updateTag(t.id, { groupId: null }));

        // 2. Delete group
        deleteBudgetGroup(groupId);
    };

    const handleCreateTag = () => {
        if (newName.trim()) {
            addTag(newName, newColor, newGroupId || null);
            setNewName('');
            setNewColor('#2383e2');
            // Keep the group selection for rapid entry
            // setNewGroupId(''); 
            setIsCreating(false);
        }
    };

    const startEditingTag = (tag) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
        setEditGroupId(tag.groupId || '');
    };

    const saveEditTag = (id) => {
        updateTag(id, { name: editName, color: editColor, groupId: editGroupId || null });
        setEditingId(null);
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

    // --- Render Helpers ---

    const renderTagItem = (tag) => {
        if (editingId === tag.id) {
            return (
                <div key={tag.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px', border: '1px solid var(--notion-border)', borderRadius: '4px',
                    width: '100%', maxWidth: '400px'
                }}>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    {/* Allow moving tag between groups during edit */}
                    <select value={editGroupId} onChange={(e) => setEditGroupId(e.target.value)} style={inputStyle}>
                        <option value="">Uncategorized</option>
                        {budgetGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} style={colorInputStyle} />
                    <button onClick={() => saveEditTag(tag.id)} style={actionButtonStyle}><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} style={cancelButtonStyle}><X size={14} /></button>
                </div>
            );
        }

        return (
            <div key={tag.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', borderRadius: '16px',
                backgroundColor: getTagColor(tag.color).bg,
                border: '1px solid var(--notion-border)',
                fontSize: '14px', position: 'relative',
                cursor: 'default'
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tag.color }}></div>
                <span style={{ fontWeight: 500 }}>{tag.name}</span>
                <div style={{ marginLeft: '8px', display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEditingTag(tag)} style={{ ...iconButtonStyle, padding: '2px' }}><Edit2 size={12} /></button>
                    <button onClick={() => { if (window.confirm(`Delete tag "${tag.name}"?`)) deleteTag(tag.id); }} style={{ ...iconButtonStyle, padding: '2px' }}><Trash2 size={12} /></button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '32px 48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Values & Groups</h1>
                    <p style={{ color: 'var(--notion-text-gray)', marginTop: '8px' }}>Organize your spending by groups and tags.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setIsCreatingGroup(true)} style={{
                        background: 'transparent', border: '1px solid var(--notion-text)', borderRadius: '4px',
                        color: 'var(--notion-text)',
                        padding: '6px 12px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                    }}>
                        <FolderOpen size={16} /> New Group
                    </button>
                    <button onClick={() => { setIsCreating(true); setNewGroupId(''); }} style={{
                        background: '#2383e2', color: 'white', border: 'none', borderRadius: '4px',
                        padding: '6px 12px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                    }}>
                        <Plus size={16} /> New Tag
                    </button>
                </div>
            </div>

            {/* Create Group Inline */}
            {isCreatingGroup && (
                <div style={{
                    border: '1px solid var(--notion-border)', borderRadius: '8px', padding: '16px',
                    marginBottom: '24px', backgroundColor: 'var(--notion-hover)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group Name" autoFocus style={inputStyle} />
                    <input type="number" value={newGroupLimit} onChange={(e) => setNewGroupLimit(e.target.value)} placeholder="Limit ($)" style={inputStyle} />
                    <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} style={colorInputStyle} />
                    <button onClick={handleCreateGroup} style={actionButtonStyle}><Check size={16} /></button>
                    <button onClick={() => setIsCreatingGroup(false)} style={cancelButtonStyle}><X size={16} /></button>
                </div>
            )}

            {/* Create Tag Inline (Global) */}
            {isCreating && (
                <div style={{
                    border: '1px solid #2383e2', borderRadius: '8px', padding: '16px',
                    marginBottom: '24px', backgroundColor: 'var(--notion-bg)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>New Tag:</span>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tag Name" autoFocus style={{ ...inputStyle, flex: 1 }} />
                    <select value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)} style={inputStyle}>
                        <option value="">Uncategorized</option>
                        {budgetGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} style={colorInputStyle} />
                    <button onClick={handleCreateTag} style={actionButtonStyle}><Check size={16} /></button>
                    <button onClick={() => setIsCreating(false)} style={cancelButtonStyle}><X size={16} /></button>
                </div>
            )}

            {/* --- HIERARCHICAL LIST --- */}

            {budgetGroups.map(group => (
                <div key={group.id} style={{ ...groupCardStyle, borderColor: group.color + '66' }}>
                    {/* Group Header */}
                    <div style={{ ...groupHeaderStyle, borderLeft: `4px solid ${group.color}` }}>
                        {editingGroupId === group.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                <input value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} style={inputStyle} />
                                <input type="number" value={editGroupLimit} onChange={(e) => setEditGroupLimit(e.target.value)} style={inputStyle} />
                                <input type="color" value={editGroupColor} onChange={(e) => setEditGroupColor(e.target.value)} style={colorInputStyle} />
                                <button onClick={() => saveEditGroup(group.id)} style={actionButtonStyle}><Check size={16} /></button>
                                <button onClick={() => setEditingGroupId(null)} style={cancelButtonStyle}><X size={16} /></button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Folder size={20} color={group.color} />
                                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{group.name}</span>
                                    <span style={{ fontSize: '13px', color: 'var(--notion-text-gray)', fontWeight: 400 }}>
                                        Limit: R$ {group.limit.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => { setIsCreating(true); setNewGroupId(group.id); }} style={iconButtonStyle} title="Add Tag to Group"><Plus size={16} /></button>
                                    <button onClick={() => startEditingGroup(group)} style={iconButtonStyle}><Edit2 size={16} /></button>
                                    <button onClick={() => handleDeleteGroup(group.id)} style={iconButtonStyle}><Trash2 size={16} /></button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Group Tags */}
                    <div style={groupBodyStyle}>
                        {tags.filter(t => t.groupId === group.id).length === 0 ? (
                            <span style={{ fontSize: '13px', color: 'var(--notion-text-gray)', fontStyle: 'italic' }}>No tags in this group.</span>
                        ) : (
                            tags.filter(t => t.groupId === group.id).map(tag => renderTagItem(tag))
                        )}
                    </div>
                </div>
            ))}

            {/* --- UNCATEGORIZED --- */}
            {tags.filter(t => !t.groupId).length > 0 && (
                <div style={groupCardStyle}>
                    <div style={groupHeaderStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FolderOpen size={20} color="var(--notion-text-gray)" />
                            <span style={{ fontWeight: 600, fontSize: '16px' }}>Uncategorized</span>
                        </div>
                        <button onClick={() => { setIsCreating(true); setNewGroupId(''); }} style={iconButtonStyle} title="Add Tag"><Plus size={16} /></button>
                    </div>
                    <div style={groupBodyStyle}>
                        {tags.filter(t => !t.groupId).map(tag => renderTagItem(tag))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default TagsManager;
