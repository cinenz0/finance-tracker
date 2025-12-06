import {
    Coffee, ShoppingBag, Home, Car, Utensils, Zap,
    Smartphone, Gift, Plane, Heart, Briefcase, GraduationCap,
    Music, Film, Gamepad, Wifi, Hammer, CreditCard, Banknote, FileText
} from 'lucide-react';

export const iconMap = {
    'file-text': FileText,
    'coffee': Coffee,
    'shopping-bag': ShoppingBag,
    'home': Home,
    'car': Car,
    'utensils': Utensils,
    'zap': Zap,
    'smartphone': Smartphone,
    'gift': Gift,
    'plane': Plane,
    'heart': Heart,
    'briefcase': Briefcase,
    'graduation-cap': GraduationCap,
    'music': Music,
    'film': Film,
    'gamepad': Gamepad,
    'wifi': Wifi,
    'hammer': Hammer,
    'credit-card': CreditCard,
    'banknote': Banknote,
};

const IconPicker = ({ selectedIcon, onSelect }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', padding: '8px', border: '1px solid var(--notion-border)', borderRadius: '4px', background: 'var(--notion-bg)' }}>
            {Object.keys(iconMap).map(iconName => {
                const Icon = iconMap[iconName];
                const isSelected = selectedIcon === iconName;

                return (
                    <div
                        key={iconName}
                        onClick={() => onSelect(iconName)}
                        style={{
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '24px', height: '24px', borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--notion-text)' : 'transparent',
                            color: isSelected ? 'var(--notion-bg)' : 'var(--notion-text-gray)',
                            transition: 'all 0.1s'
                        }}
                        title={iconName}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'var(--notion-hover)';
                                e.currentTarget.style.color = 'var(--notion-text)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--notion-text-gray)';
                            }
                        }}
                    >
                        <Icon size={16} />
                    </div>
                );
            })}
        </div>
    );
};

export default IconPicker;
