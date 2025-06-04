import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface Props {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Function to send error to iframe parent (web only)
const sendErrorToIframeParent = (error: Error, errorInfo: React.ErrorInfo) => {
    if (Platform.OS === 'web') {
        // Post error to parent window
        window.parent?.postMessage(
            {
                type: 'error',
                error: {
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                },
            },
            '*'
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        maxWidth: 500,
        width: '100%',
    },
    title: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.error,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        sendErrorToIframeParent(error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>{this.state.error?.message}</Text>
                        {Platform.OS !== 'web' && (
                            <Text style={styles.description}>
                                Please check your device logs for more details.
                            </Text>
                        )}
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
} 

export default ErrorBoundary; 