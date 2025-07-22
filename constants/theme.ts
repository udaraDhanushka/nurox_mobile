export const COLORS = {
    // Primary colors
    primary: '#4A80F0',
    secondary: '#7D67EE',

    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Neutral colors
    black: '#333333',
    darkGray: '#666666',
    gray: '#999999',
    lightGray: '#CCCCCC',
    veryLightGray: '#F5F5F5',
    white: '#FFFFFF',

    // Background colors
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',

    // Text colors
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',

    // Border colors
    border: '#E1E4E8',

    // Transparent colors
    transparentPrimary: 'rgba(74, 128, 240, 0.1)',
    transparentSuccess: 'rgba(76, 175, 80, 0.1)',
    transparentError: 'rgba(244, 67, 54, 0.1)',
    transparentBlack: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
    regular: {
        fontWeight: '400' as const,
    },
    medium: {
        fontWeight: '500' as const,
    },
    semiBold: {
        fontWeight: '600' as const,
    },
    bold: {
        fontWeight: '700' as const,
    },
};

export const SIZES = {
    // Font sizes
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },

    // Border radius
    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        round: 999,
    },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5.46,
        elevation: 5,
    },
};