import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Card,
  Divider,
} from "react-native-paper";
import { getChart } from "../api/endpoints";
import VedicChartWheel, { buildHouses } from "../components/VedicChartWheel";
import type { BirthChart, Planet } from "../types";
import { colors } from "../constants/theme";

function retroLabel(p: Planet) {
  return p.retrograde ? " (R)" : "";
}

function findPlanet(planets: Planet[], name: string): Planet | undefined {
  return planets.find((p) => p.name === name);
}

export default function ChartViewScreen() {
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getChart();
        setChart(data);
      } catch {
        setError("Could not load birth chart.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !chart) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const planets = chart?.chart_data.planets ?? [];
  const aspects = chart?.chart_data.aspects ?? [];

  const sun = findPlanet(planets, "Sun");
  const moon = findPlanet(planets, "Moon");
  const houses = planets.length > 0 ? buildHouses(planets) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Visual Chart */}
      {houses.length > 0 && (
        <Card style={[styles.card, styles.chartCard]}>
          <Card.Content style={styles.chartContent}>
            <Text style={styles.cardTitle}>Birth Chart</Text>
            <VedicChartWheel houses={houses} size={280} />
          </Card.Content>
        </Card>
      )}

      {/* Key Signs */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Your Key Signs</Text>
          <View style={styles.keySignsRow}>
            <View style={styles.keySign}>
              <Text style={styles.keySignLabel}>Sun</Text>
              <Text style={styles.keySignValue}>
                {sun?.sign ?? "—"}
              </Text>
            </View>
            <View style={styles.keySign}>
              <Text style={styles.keySignLabel}>Moon</Text>
              <Text style={styles.keySignValue}>
                {moon?.sign ?? "—"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* All Planets */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Planetary Positions</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.headerText]}>Planet</Text>
            <Text
              style={[
                styles.tableCell,
                styles.headerText,
                styles.tableCellRight,
              ]}
            >
              Sign & Degree
            </Text>
          </View>
          <Divider style={styles.divider} />
          {planets.map((p, index) => (
            <View
              key={p.name}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              <Text style={[styles.tableCell, styles.planetName]}>
                {p.name}
                {retroLabel(p) && (
                  <Text style={styles.retroTag}>{retroLabel(p)}</Text>
                )}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellRight,
                  styles.planetPosition,
                ]}
              >
                {p.sign} {p.degree_in_sign.toFixed(1)}°
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Aspects */}
      {aspects.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Major Aspects</Text>
            {aspects.map((a, i) => (
              <View key={i} style={styles.aspectRow}>
                <View style={styles.aspectMain}>
                  <Text style={styles.aspectPlanet}>{a.planet1}</Text>
                  <Text style={styles.aspectType}>{a.aspect}</Text>
                  <Text style={styles.aspectPlanet}>{a.planet2}</Text>
                </View>
                <Text style={styles.aspectOrb}>orb {a.orb}°</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

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
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 12,
  },
  chartCard: {
    alignItems: "center",
  },
  chartContent: {
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  // Key signs row
  keySignsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  keySign: {
    alignItems: "center",
  },
  keySignLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  keySignValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center",
  },
  tableCell: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableRowAlt: {
    backgroundColor: colors.surfaceLight,
  },
  planetName: {
    fontWeight: "600",
  },
  planetPosition: {
    fontVariant: ["tabular-nums"],
  },
  retroTag: {
    fontSize: 12,
    color: colors.secondary,
  },
  headerText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  // Aspects
  aspectRow: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  aspectMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  aspectPlanet: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  aspectType: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  aspectOrb: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
