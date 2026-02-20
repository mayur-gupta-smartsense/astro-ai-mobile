import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, Divider } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { getBirthProfile, getChart } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import VedicChartWheel, { buildHouses } from "../components/VedicChartWheel";
import type { BirthProfile, BirthChart } from "../types";
import { colors } from "../constants/theme";

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [chart, setChart] = useState<BirthChart | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const data = await getBirthProfile();
          setProfile(data);
        } catch {
          /* no profile — shouldn't happen in main app */
        }
        try {
          const data = await getChart();
          setChart(data);
        } catch {
          /* chart may not be available yet */
        }
      })();
    }, [])
  );

  const planets = chart?.chart_data.planets ?? [];
  const houses = planets.length > 0 ? buildHouses(planets) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Mini Chart */}
      {houses.length > 0 && (
        <Card style={[styles.card, styles.chartCard]}>
          <Card.Content style={styles.chartContent}>
            <VedicChartWheel houses={houses} size={220} />
          </Card.Content>
        </Card>
      )}

      {/* Birth Profile card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Ionicons name="planet-outline" size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Birth Details</Text>
          </View>

          {profile ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{profile.full_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{profile.gender}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{profile.birth_date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{profile.birth_time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{profile.birth_location}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No birth profile found</Text>
          )}
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("ChartView")}
            compact
          >
            View My Chart
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("EditProfile", { profile })}
            textColor={colors.primaryLight}
            compact
          >
            Edit Details
          </Button>
        </Card.Actions>
      </Card>

      {/* Logout */}
      <Divider style={styles.divider} />

      <Button
        mode="text"
        onPress={logout}
        textColor={colors.error}
        icon="logout"
        style={styles.logoutBtn}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  chartCard: {
    alignItems: "center",
  },
  chartContent: {
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    minHeight: 36,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    flexShrink: 0,
    marginRight: 12,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  divider: {
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  logoutBtn: {
    marginTop: 8,
  },
});
