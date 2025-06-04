import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, User } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';

// Define message type
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: string;
}

// Mock initial messages
const initialMessages: Message[] = [
    {
        id: '1',
        text: 'Hello! How can I help you today?',
        sender: 'support',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
        id: '2',
        text: 'I have a question about my recent prescription.',
        sender: 'user',
        timestamp: new Date(Date.now() - 3500000).toISOString() // 58 minutes ago
    },
    {
        id: '3',
        text: "I'd be happy to help with that. Could you please provide more details about your prescription?",
        sender: 'support',
        timestamp: new Date(Date.now() - 3400000).toISOString() // 56 minutes ago
    }
];

const ChatScreen = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList<Message>>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSend = () => {
        if (inputText.trim() === '') return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputText('');

        // Simulate support response after a delay
        setTimeout(() => {
            const supportResponses = [
                "Thank you for providing that information. Let me check that for you.",
                "I understand your concern. Let me connect you with a specialist who can help.",
                "I've noted your question. Our healthcare team will review and get back to you within 24 hours.",
                "That's a good question. Based on your medical history, I recommend discussing this with your doctor at your next appointment.",
                "I've checked your records. Your prescription should be ready for pickup tomorrow."
            ];

            const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];

            const supportMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: randomResponse,
                sender: 'support',
                timestamp: new Date().toISOString()
            };

            setMessages(prevMessages => [...prevMessages, supportMessage]);
        }, 1000);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';

        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessageContainer : styles.supportMessageContainer
            ]}>
                {!isUser && (
                    <View style={styles.supportAvatar}>
                        <User size={16} color={COLORS.white} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userMessageBubble : styles.supportMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.supportMessageText
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={styles.timestampText}>
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Healthcare Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type your message..."
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !inputText.trim() && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Send size={20} color={!inputText.trim() ? COLORS.lightGray : COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    content: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    supportMessageContainer: {
        justifyContent: 'flex-start',
    },
    supportAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
    },
    userMessageBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    supportMessageBubble: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: SIZES.md,
        marginBottom: 4,
    },
    userMessageText: {
        color: COLORS.white,
    },
    supportMessageText: {
        color: COLORS.textPrimary,
    },
    timestampText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        opacity: 0.8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: SIZES.md,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.border,
    },
});

export default ChatScreen; 