import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Theme state
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('finance_app_theme') || 'dark';
    });

    // Account Name state
    const [accountName, setAccountName] = useState(() => {
        return localStorage.getItem('finance_app_account_name') || "Pichau's Finance";
    });

    // Profile Image state
    const [profileImage, setProfileImage] = useState(() => {
        return localStorage.getItem('finance_app_profile_image') || null;
    });

    // Tag Registry
    const [tags, setTags] = useState(() => {
        const stored = localStorage.getItem('finance_app_tags');
        return stored ? JSON.parse(stored) : [
            { id: '1', name: 'Dining Out', color: 'blue' },
            { id: '2', name: 'Rent/Mortgage', color: 'red' },
            { id: '3', name: 'Utilities', color: 'yellow' },
            { id: '4', name: 'Groceries', color: 'green' },
            { id: '5', name: 'Salary', color: 'green' },
            { id: '6', name: 'Freelance', color: 'purple' },
        ];
    });

    // Investment Types Registry
    const [investmentTypes, setInvestmentTypes] = useState(() => {
        const stored = localStorage.getItem('finance_app_investment_types');
        return stored ? JSON.parse(stored) : [
            { id: '1', name: 'CDB', color: 'blue' },
            { id: '2', name: 'LCI', color: 'green' },
            { id: '3', name: 'LCA', color: 'green' },
            { id: '4', name: 'Stock', color: 'purple' },
            { id: '5', name: 'FII', color: 'orange' },
            { id: '6', name: 'Treasury', color: 'yellow' },
            { id: '7', name: 'Crypto', color: 'gray' },
            { id: '8', name: 'Other', color: 'default' },
        ];
    });

    // Notion Colors
    const tagColors = {
        default: { bg: '#e3e2e0', text: '#32302c' },
        gray: { bg: '#e3e2e0', text: '#32302c' },
        brown: { bg: '#eee0da', text: '#442a1e' },
        orange: { bg: '#fadec9', text: '#49290e' },
        yellow: { bg: '#fdecc8', text: '#402c1b' },
        green: { bg: '#dbeddb', text: '#1c3829' },
        blue: { bg: '#d3e5ef', text: '#183347' },
        purple: { bg: '#e8deee', text: '#412454' },
        pink: { bg: '#f5e0e9', text: '#4c2337' },
        red: { bg: '#ffe2dd', text: '#5d1715' },
    };

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('finance_app_theme', theme);
    }, [theme]);

    // Persist account name
    useEffect(() => {
        localStorage.setItem('finance_app_account_name', accountName);
    }, [accountName]);

    // Persist tags
    useEffect(() => {
        localStorage.setItem('finance_app_tags', JSON.stringify(tags));
    }, [tags]);

    // Persist investment types
    useEffect(() => {
        localStorage.setItem('finance_app_investment_types', JSON.stringify(investmentTypes));
    }, [investmentTypes]);

    // Persist profile image
    useEffect(() => {
        if (profileImage) {
            localStorage.setItem('finance_app_profile_image', profileImage);
        } else {
            localStorage.removeItem('finance_app_profile_image');
        }
    }, [profileImage]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const updateAccountName = (name) => {
        setAccountName(name);
    };

    const updateProfileImage = (dataUrl) => {
        setProfileImage(dataUrl);
    };

    const addTag = (name, color) => {
        const newTag = { id: crypto.randomUUID(), name, color };
        setTags(prev => [...prev, newTag]);
        return newTag;
    };

    const updateTag = (id, updates) => {
        setTags(prev => prev.map(tag =>
            tag.id === id ? { ...tag, ...updates } : tag
        ));
    };

    const deleteTag = (id) => {
        setTags(prev => prev.filter(tag => tag.id !== id));
    };

    const addInvestmentType = (name, color) => {
        const newType = { id: crypto.randomUUID(), name, color };
        setInvestmentTypes(prev => [...prev, newType]);
        return newType;
    };

    const updateInvestmentType = (id, updates) => {
        setInvestmentTypes(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates } : t
        ));
    };

    const deleteInvestmentType = (id) => {
        setInvestmentTypes(prev => prev.filter(t => t.id !== id));
    };

    const getContrastColor = (hexcolor) => {
        // If it isn't a valid hex, default to black
        if (!hexcolor || !hexcolor.startsWith('#')) return '#000000';

        // Convert to RGB
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);

        // Calculate YIQ ratio
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        // Return black or white depending on contrast
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    const getTagColor = (colorName) => {
        if (colorName && colorName.startsWith('#')) {
            return { bg: colorName, text: getContrastColor(colorName) };
        }
        return tagColors[colorName] || tagColors['default'];
    };

    const value = {
        theme,
        toggleTheme,
        accountName,
        updateAccountName,
        profileImage,
        updateProfileImage,
        tags,
        addTag,
        updateTag,
        deleteTag,
        investmentTypes,
        addInvestmentType,
        updateInvestmentType,
        deleteInvestmentType,
        tagColors,
        getTagColor
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
