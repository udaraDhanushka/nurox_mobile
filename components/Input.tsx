import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    KeyboardTypeOptions,
    ReturnKeyTypeOptions
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface InputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    returnKeyType?: ReturnKeyTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    error?: string;
    disabled?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    onBlur?: () => void;
    onFocus?: () => void;
    onSubmitEditing?: () => void;
}

export const Input: React.FC<InputProps> = ({
                                                label,
                                                value,
                                                onChangeText,
                                                placeholder,
                                                secureTextEntry = false,
                                                keyboardType = 'default',
                                                returnKeyType = 'done',
                                                autoCapitalize = 'none',
                                                autoCorrect = false,
                                                error,
                                                disabled = false,
                                                multiline = false,
                                                numberOfLines = 1,
                                                style,
                                                inputStyle,
                                                onBlur,
                                                onFocus,
                                                onSubmitEditing
                                            }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) onFocus();
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) onBlur();
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                error && styles.inputError,
                disabled && styles.inputDisabled
            ]}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        inputStyle
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    returnKeyType={returnKeyType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onSubmitEditing={onSubmitEditing}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={togglePasswordVisibility}
                        disabled={disabled}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color={COLORS.gray} />
                        ) : (
                            <Eye size={20} color={COLORS.gray} />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: COLORS.white,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: 12,
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    iconButton: {
        padding: 10,
    },
    inputFocused: {
        borderColor: COLORS.primary,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    inputDisabled: {
        backgroundColor: COLORS.veryLightGray,
        opacity: 0.7,
    },
    errorText: {
        fontSize: SIZES.xs,
        color: COLORS.error,
        marginTop: 4,
    },
});