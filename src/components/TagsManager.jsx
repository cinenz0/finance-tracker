import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Tag, Edit2, Trash2, Plus, Check, X } from 'lucide-react';

const TagsManager = () => {
    const { tags, addTag, updateTag, deleteTag, getTagColor } = useSettings();
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#2383e2');

    const startEditing = (tag) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
    };

    const saveEdit = (id) => {
        updateTag(id, { name: editName, color: editColor });
        setEditingId(null);
    };

    const handleCreate = () => {
        if (newName.trim()) {
            addTag(newName, newColor);
            setNewName('');
            setNewColor('#2383e2');
            setIsCreating(false);
        }
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

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tags.map(tag => (
                    <div key={tag.id} style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '12px', border: '1px solid var(--notion-border)', borderRadius: '4px',
                        backgroundColor: 'var(--notion-bg)'
                    }}>
                        {editingId === tag.id ? (
                            <>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ flex: 1, padding: '6px', border: '1px solid var(--notion-border)', borderRadius: '4px', background: 'var(--notion-bg)', color: 'var(--notion-text)' }}
                                />
                                <input
                                    type="color"
                                    value={editColor.startsWith('#') ? editColor : getTagColor(editColor).bg}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    style={{ border: 'none', width: '32px', height: '32px', padding: 0, background: 'transparent', cursor: 'pointer' }}
                                />
                                <button onClick={() => saveEdit(tag.id)} style={{ padding: '6px', background: 'var(--notion-text)', color: 'var(--notion-bg)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={16} /></button>
                                <button onClick={() => setEditingId(null)} style={{ padding: '6px', background: 'transparent', color: 'var(--notion-text-gray)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><X size={16} /></button>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    backgroundColor: getTagColor(tag.color).bg,
                                    border: '1px solid var(--notion-border)'
                                }}></div>
                                <span style={{ flex: 1, fontWeight: 500 }}>{tag.name}</span>

                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => startEditing(tag)}
                                        style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--notion-text-gray)', cursor: 'pointer' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Delete tag "${tag.name}"?`)) deleteTag(tag.id);
                                        }}
                                        style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--notion-text-gray)', cursor: 'pointer' }}
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
