import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { Text } from "react-native-paper";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

interface Props {
  onRecordComplete: (audioUri: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordComplete, disabled }: Props) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    if (disabled) return;

    try {
      // Unload any lingering recording to avoid
      // "Only one Recording object can be prepared at a given time"
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {
          // already stopped – ignore
        }
        setRecording(null);
      }

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);
      setDuration(0);
      if (uri) {
        onRecordComplete(uri);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setRecording(null);
      setDuration(0);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.statusRow}>
          <View style={styles.redDot} />
          <Text style={styles.listeningText}>Listening...</Text>
          <Text style={styles.timerText}>{formatDuration(duration)}</Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={[
            styles.recordBtn,
            isRecording && styles.recordBtnActive,
            disabled && styles.recordBtnDisabled,
          ]}
          disabled={disabled}
        >
          <Ionicons
            name={isRecording ? "mic" : "mic-outline"}
            size={36}
            color="#FFFFFF"
          />
        </Pressable>
      </Animated.View>

      <Text style={styles.hint}>
        {disabled ? "Processing..." : "Press & hold to speak"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  listeningText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  timerText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: "monospace",
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  recordBtnActive: {
    backgroundColor: colors.error,
  },
  recordBtnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
});
