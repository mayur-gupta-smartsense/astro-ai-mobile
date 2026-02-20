import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { TextInput, Text, Snackbar, ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import {
  getConversation,
  sendMessage,
  sendVoiceMessage,
  getMessageAudio,
} from "../api/endpoints";
import type { Message } from "../types";
import MessageBubble from "../components/MessageBubble";
import VoiceRecorder from "../components/VoiceRecorder";
import AudioPlayer from "../components/AudioPlayer";
import { colors } from "../constants/theme";

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, title } = route.params;
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [error, setError] = useState("");

  // Audio response playback
  const [audioUri, setAudioUri] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  // Load existing messages
  useEffect(() => {
    (async () => {
      try {
        const conv = await getConversation(conversationId);
        setMessages(conv.messages);
      } catch {
        setError("Could not load conversation");
      } finally {
        setLoadingChat(false);
      }
    })();
  }, [conversationId]);

  // --- Voice flow ---
  const handleVoiceComplete = async (uri: string) => {
    setProcessing(true);
    setAudioUri(null);
    try {
      const result = await sendVoiceMessage(conversationId, uri);

      // Add user message (transcribed)
      const userMsg: Message = {
        id: `tmp-user-${Date.now()}`,
        role: "user",
        content: result.transcript,
        created_at: new Date().toISOString(),
      };

      // Add assistant message
      const assistantMsg: Message = {
        id: result.response.id,
        role: "assistant",
        content: result.response.content,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Save base64 audio to temp file and auto-play
      if (result.response.audio_base64) {
        const tmpPath = `${FileSystem.cacheDirectory}response_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(tmpPath, result.response.audio_base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setAudioUri(tmpPath);
      }
    } catch {
      setError("Voice message failed");
    } finally {
      setProcessing(false);
    }
  };

  // --- Text flow ---
  const handleSendText = async () => {
    const text = textInput.trim();
    if (!text || processing) return;

    setTextInput("");
    setProcessing(true);
    setAudioUri(null);

    // Optimistic user message
    const tmpUser: Message = {
      id: `tmp-user-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tmpUser]);

    try {
      const assistantMsg = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("Failed to send message");
    } finally {
      setProcessing(false);
    }
  };

  // --- Play TTS for any assistant message ---
  const handlePlayAudio = async (messageId: string) => {
    try {
      const { audio_base64 } = await getMessageAudio(messageId);
      const tmpPath = `${FileSystem.cacheDirectory}tts_${messageId}.mp3`;
      await FileSystem.writeAsStringAsync(tmpPath, audio_base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setAudioUri(tmpPath);
    } catch {
      setError("Could not load audio");
    }
  };

  // Scroll to bottom when messages change
  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length, scrollToEnd]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Messages */}
      {loadingChat ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} onPlayAudio={handlePlayAudio} />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToEnd}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="sparkles-outline" size={40} color={colors.border} />
              <Text style={styles.emptyChatText}>
                Hold the mic button and ask about your chart
              </Text>
            </View>
          }
        />
      )}

      {/* Audio playback bar */}
      {audioUri && (
        <View style={styles.audioBar}>
          <AudioPlayer audioUri={audioUri} autoPlay />
        </View>
      )}

      {/* Processing indicator */}
      {processing && (
        <View style={styles.processingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>Thinking...</Text>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputArea}>
        {/* Voice recorder — primary */}
        <VoiceRecorder onRecordComplete={handleVoiceComplete} disabled={processing} />

        {/* Text toggle */}
        <Pressable onPress={() => setTextMode((v) => !v)} style={styles.textToggle}>
          <Ionicons
            name={textMode ? "chevron-down" : "keypad-outline"}
            size={18}
            color={colors.textSecondary}
          />
          <Text style={styles.textToggleLabel}>
            {textMode ? "Hide keyboard" : "Type instead"}
          </Text>
        </Pressable>

        {/* Text input */}
        {textMode && (
          <View style={styles.textRow}>
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              mode="outlined"
              style={styles.textInput}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              dense
              right={
                <TextInput.Icon
                  icon="send"
                  color={textInput.trim() ? colors.primary : colors.border}
                  onPress={handleSendText}
                />
              }
              onSubmitEditing={handleSendText}
            />
          </View>
        )}
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    gap: 12,
  },
  emptyChatText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  // Audio bar
  audioBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  // Processing
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 8,
  },
  processingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  // Input area
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
  },
  textToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  textToggleLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  textRow: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  textInput: {
    backgroundColor: colors.background,
    fontSize: 14,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});
