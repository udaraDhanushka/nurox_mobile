import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS } from '@/constants/theme';

export function FloatingChatButton() {
    const router = useRouter();
    const glowAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.glow,
                {
                    opacity: glowAnim,
                    transform: [{
                        scale: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.3]
                        })
                    }]
                }
            ]} />
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(patient)/chat')}
            >
                <MessageCircle size={24} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: '#0984e3',
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0984e3',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
}); 