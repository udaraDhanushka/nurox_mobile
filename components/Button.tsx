import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  variant = 'primary',
                                                  size = 'medium',
                                                  isLoading = false,
                                                  disabled = false,
                                                  style,
                                                  textStyle,
                                                  icon
                                              }) => {
    const getButtonStyle = () => {
        let buttonStyle: ViewStyle = {};

        // Variant styles
        switch (variant) {
            case 'primary':
                buttonStyle = {
                    backgroundColor: COLORS.primary,
                    borderWidth: 0,
                };
                break;
            case 'secondary':
                buttonStyle = {
                    backgroundColor: COLORS.secondary,
                    borderWidth: 0,
                };
                break;
            case 'outline':
                buttonStyle = {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: COLORS.primary,
                };
                break;
            case 'text':
                buttonStyle = {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                };
                break;
        }

        // Size styles
        switch (size) {
            case 'small':
                buttonStyle = {
                    ...buttonStyle,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                };
                break;
            case 'medium':
                buttonStyle = {
                    ...buttonStyle,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                };
                break;
            case 'large':
                buttonStyle = {
                    ...buttonStyle,
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                };
                break;
        }

        // Disabled state
        if (disabled || isLoading) {
            buttonStyle = {
                ...buttonStyle,
                opacity: 0.6,
            };
        }

        return buttonStyle;
    };

    const getTextStyle = () => {
        let style: TextStyle = {
            fontSize: SIZES.md,
            fontWeight: '600',
        };

        switch (variant) {
            case 'primary':
            case 'secondary':
                style = {
                    ...style,
                    color: COLORS.white,
                };
                break;
            case 'outline':
            case 'text':
                style = {
                    ...style,
                    color: COLORS.primary,
                };
                break;
        }

        switch (size) {
            case 'small':
                style = {
                    ...style,
                    fontSize: SIZES.sm,
                };
                break;
            case 'large':
                style = {
                    ...style,
                    fontSize: SIZES.lg,
                };
                break;
        }

        return style;
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
            {isLoading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' || variant === 'secondary' ? COLORS.white : COLORS.primary}
                />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});