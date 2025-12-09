import { LayoutDashboard, Wallet, PiggyBank, Settings, ChevronLeft, Moon, Sun, Edit2, AlertTriangle, Tag, TrendingUp, Camera, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useFinance } from '../context/FinanceContext';
import { useState, useRef } from 'react';
import pkg from '../../package.json';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { accountName, theme, toggleTheme, updateAccountName, profileImage, updateProfileImage } = useSettings();
    const { importTransactions } = useFinance();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(accountName);
    const [importStatus, setImportStatus] = useState(null);
    const fileInputRef = useRef(null);
    const csvInputRef = useRef(null);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'expenses', label: 'Expenses', icon: Wallet },
        { id: 'income', label: 'Income', icon: TrendingUp },
        { id: 'investments', label: 'Investments', icon: PiggyBank },
        { id: 'tags', label: 'Tags', icon: Tag },
    ];

    const handleSaveName = () => {
        updateAccountName(tempName);
        setIsEditingName(false);
    };

    const handleResetData = () => {
        if (window.confirm('ARE YOU SURE? This will permanently delete ALL transactions and custom tags. This cannot be undone.')) {
            localStorage.removeItem('finance_app_transactions');
            localStorage.removeItem('finance_app_tags');
            localStorage.removeItem('finance_app_profile_image');
            window.location.reload();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCsvImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const result = importTransactions(content);
            if (result.success) {
                setImportStatus(`✅ Imported ${result.count} transactions`);
            } else {
                setImportStatus('❌ Import failed');
            }

            // Clear status after 3 seconds
            setTimeout(() => setImportStatus(null), 3000);

            // Reset input so same file can be selected again if needed
            if (csvInputRef.current) csvInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleRemovePhoto = () => {
        if (window.confirm('Remove profile photo?')) {
            updateProfileImage(null);
        }
    };

    return (
        <aside style={{
            width: '240px',
            backgroundColor: 'var(--notion-bg-gray)',
            borderRight: '1px solid var(--notion-border)',
            height: '100%',
            padding: '12px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <input
                type="file"
                ref={csvInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleCsvImport}
            />

            {/* Account Switcher / Header */}
            <div style={{ padding: '0 12px', marginBottom: '8px' }}>
                <div
                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--notion-text)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', borderRadius: '4px' }}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="hover-bg"
                >
                    <style>{`
                        .hover-bg:hover { background-color: var(--notion-hover); }
                    `}</style>
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt="Profile"
                            style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '20px', height: '20px', background: 'var(--notion-text)', color: 'var(--notion-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>{accountName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{accountName}</span>
                    <ChevronLeft size={12} style={{ transform: isSettingsOpen ? 'rotate(-90deg)' : 'rotate(-180deg)', marginLeft: 'auto', transition: 'transform 0.2s', color: 'var(--notion-text-gray)' }} />
                </div>
            </div>

            {/* Settings Popover */}
            {isSettingsOpen && (
                <div style={{
                    margin: '0 12px 12px 12px',
                    padding: '8px',
                    backgroundColor: 'var(--notion-bg)',
                    border: '1px solid var(--notion-border)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', fontSize: '12px', color: 'var(--notion-text-gray)' }}>
                        <span>Appearance</span>
                        <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--notion-text)' }}>
                            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                            {theme === 'dark' ? 'Dark' : 'Light'}
                        </button>
                    </div>

                    <div style={{ padding: '8px', borderTop: '1px solid var(--notion-border)' }}>
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--notion-text)', cursor: 'pointer', padding: '4px 0' }}
                        >
                            <Camera size={12} /> Change Photo
                        </div>
                        {profileImage && (
                            <div
                                onClick={handleRemovePhoto}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ea6b6b', cursor: 'pointer', padding: '4px 0' }}
                            >
                                <X size={12} /> Remove Photo
                            </div>
                        )}
                    </div>

                    {/* CSV Import Section */}
                    <div style={{ padding: '8px', borderTop: '1px solid var(--notion-border)' }}>
                        <div
                            onClick={() => csvInputRef.current.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--notion-text)', cursor: 'pointer', padding: '4px 0' }}
                        >
                            <Wallet size={12} /> Import Bank Statement
                        </div>
                        {importStatus && (
                            <div style={{ fontSize: '11px', color: importStatus.includes('✅') ? '#59b98c' : '#ea6b6b', marginTop: '4px', paddingLeft: '20px' }}>
                                {importStatus}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '8px', borderTop: '1px solid var(--notion-border)' }}>
                        {isEditingName ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    style={{ width: '100%', fontSize: '12px', padding: '4px', border: '1px solid var(--notion-border)', borderRadius: '4px', background: 'var(--notion-bg)', color: 'var(--notion-text)' }}
                                    autoFocus
                                />
                                <button onClick={handleSaveName} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--notion-text)', color: 'var(--notion-bg)', borderRadius: '4px' }}>OK</button>
                            </div>
                        ) : (
                            <div
                                onClick={() => { setIsEditingName(true); setTempName(accountName); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--notion-text)', cursor: 'pointer', padding: '4px 0' }}
                            >
                                <Edit2 size={12} /> Rename Account
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '8px', borderTop: '1px solid var(--notion-border)' }}>
                        <div
                            onClick={handleResetData}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ea6b6b', cursor: 'pointer', padding: '4px 0' }}
                        >
                            <AlertTriangle size={12} /> Reset Data
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 4px' }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                color: isActive ? 'var(--notion-text)' : 'var(--notion-text-gray)',
                                backgroundColor: isActive ? 'var(--notion-hover)' : 'transparent',
                                textAlign: 'left',
                                fontSize: '14px',
                                transition: 'background 0.1s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--notion-hover)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Icon size={18} />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', padding: '8px 4px' }}>
                <div
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    style={{ padding: '8px 12px', color: 'var(--notion-text-gray)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '4px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--notion-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Settings size={14} />
                    <span>Settings</span>
                </div>
                <div style={{ padding: '0 12px 8px 12px', fontSize: '10px', color: 'var(--notion-text-gray)', opacity: 0.5 }}>
                    v{pkg.version}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
