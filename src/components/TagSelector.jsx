import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { X, Plus, Check } from 'lucide-react';

const TagSelector = ({ selectedTags = [], onChange }) => {
    const { tags, addTag, tagColors, getTagColor } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowColorPicker(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectTag = (tagName) => {
        if (!selectedTags.includes(tagName)) {
            onChange([...selectedTags, tagName]);
        }
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleRemoveTag = (tagName) => {
        onChange(selectedTags.filter(t => t !== tagName));
    };

    const handleCreateTag = (color) => {
        addTag(searchTerm, color);
        handleSelectTag(searchTerm);
        setShowColorPicker(false);
    };

    const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const inputRef = useRef(null);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {/* Selected Tags Area */}
            <div
                onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
                style={{
                    padding: '8px',
                    border: '1px solid var(--notion-border)',
                    borderRadius: '4px',
                    minHeight: '38px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    cursor: 'text',
                    background: 'var(--notion-bg)',
                    alignItems: 'center'
                }}
            >
                {selectedTags.map(tagName => {
                    const tagDef = tags.find(t => t.name === tagName);
                    // Fallback color if tag deleted or legacy
                    const colorData = tagDef ? getTagColor(tagDef.color) : tagColors['default'];

                    return (
                        <span key={tagName} style={{
                            backgroundColor: colorData.bg,
                            color: colorData.text,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            {tagName}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveTag(tagName); }}
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.6 }}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    );
                })}
                <input
                    ref={inputRef}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selectedTags.length === 0 ? "Select tags..." : ""}
                    style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        background: 'transparent',
                        color: 'var(--notion-text)',
                        flex: 1,
                        minWidth: '60px'
                    }}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--notion-bg)',
                    border: '1px solid var(--notion-border)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)', padding: '6px 8px' }}>
                        Select an option or create one
                    </div>

                    {/* Existing Tags */}
                    {filteredTags.map(tag => (
                        <div
                            key={tag.id}
                            onClick={() => handleSelectTag(tag.name)}
                            style={{
                                padding: '6px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--notion-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getTagColor(tag.color).text }}></div>
                            {tag.name}
                            {selectedTags.includes(tag.name) && <Check size={14} style={{ marginLeft: 'auto' }} />}
                        </div>
                    ))}

                    {/* Create New Tag Option */}
                    {searchTerm && !filteredTags.find(t => t.name.toLowerCase() === searchTerm.toLowerCase()) && (
                        <div style={{ padding: '8px', borderTop: '1px solid var(--notion-border)' }}>
                            {!showColorPicker ? (
                                <div
                                    onClick={() => setShowColorPicker(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    <Plus size={14} /> Create "{searchTerm}"
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--notion-text-gray)' }}>Color:</div>
                                    <input
                                        type="color"
                                        defaultValue="#2383e2"
                                        id="new-tag-color"
                                        style={{
                                            border: 'none', width: '24px', height: '24px', cursor: 'pointer',
                                            padding: 0, background: 'transparent'
                                        }}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const color = document.getElementById('new-tag-color').value;
                                            handleCreateTag(color);
                                        }}
                                        style={{
                                            marginLeft: 'auto',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            background: 'var(--notion-text)',
                                            color: 'var(--notion-bg)',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        Create
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TagSelector;
