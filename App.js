// A shim for TextEncoder is required for the wasm-pack module to load OK.
import "text-encoding";

// This particular shim complains when the label parameter is passed in.
import { LogBox } from "react-native";
LogBox.ignoreLogs([/TextEncoder constructor called with encoding label/]);

import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView } from "react-native";

// Import the wasm module.
import * as keyagg from "./keyagg";

const pubkeyInputStyles = StyleSheet.create({
  valid: {
    borderWidth: 2,
    borderColor: "green",
  },
  invalid: {
    borderWidth: 2,
    borderColor: "red",
  },
});

function PubKeyInput({ onChange, value }) {
  const validityStyle = useMemo(() => {
    if (!value) return null;
    return keyagg.is_valid_pubkey(value)
      ? pubkeyInputStyles.valid
      : pubkeyInputStyles.invalid;
  }, [value]);

  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      maxLength={66}
      style={[styles.pubkeyInput, validityStyle]}
    />
  );
}

const aggregatedKeyDisplayStyles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 20,
  },
  key: {
    color: "white",
    fontFamily: "monospace",
    fontSize: 12,
    maxWidth: "100%",
  },
});

function AggregatedKeyDisplay({ pubkeys }) {
  const [invalidKeyIndex, setInvalidKeyIndex] = useState(null);
  const [aggregatedPubkey, setAggregatedPubkey] = useState(null);

  useEffect(() => {
    try {
      const filteredPubkeys = pubkeys
        .map((key) => key.replace(/ /g, ""))
        .filter((key) => !!key);
      setAggregatedPubkey(keyagg.aggregate(filteredPubkeys));
      setInvalidKeyIndex(null);
    } catch (i) {
      setAggregatedPubkey(null);
      setInvalidKeyIndex(i);
    }
  }, [pubkeys]);

  return (
    <View style={styles.aggregatedKeyDisplay}>
      {aggregatedPubkey && (
        <>
          <Text style={aggregatedKeyDisplayStyles.title}>Aggregated Key</Text>
          <Text style={aggregatedKeyDisplayStyles.key} selectable>
            {aggregatedPubkey}
          </Text>
        </>
      )}
      {invalidKeyIndex && (
        <>
          <Text style={aggregatedKeyDisplayStyles.title}>Invalid Key</Text>
          <Text style={aggregatedKeyDisplayStyles.key}>
            "{pubkeys[invalidKeyIndex]}" is not a valid public key.
          </Text>
        </>
      )}
    </View>
  );
}

const DEFAULT_PUBKEYS = [
  "026e14224899cf9c780fef5dd200f92a28cc67f71c0af6fe30b5657ffc943f08f4",
  "02f3b071c064f115ca762ed88c3efd1927ea657c7949698b77255ea25751331f0b",
  "03204ea8bc3425b2cbc9cb20617f67dc6b202467591d0b26d059e370b71ee392eb",
  "",
];

export default function App() {
  const [pubkeys, setPubkeys] = useState(DEFAULT_PUBKEYS);

  const pubkeyInputs = pubkeys.map((pubkey, i) => {
    const onChange = (newPubkey) => {
      let newPubkeys = [
        ...pubkeys.slice(0, i),
        newPubkey,
        ...pubkeys.slice(i + 1),
      ];

      if (i === pubkeys.length - 1) {
        newPubkeys.push("");
      }
      while (newPubkeys.slice(-2).every((key) => !key)) {
        newPubkeys = newPubkeys.slice(0, -1);
      }

      setPubkeys(newPubkeys);
    };
    return <PubKeyInput key={i} value={pubkey} onChange={onChange} />;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MuSig Pubkey Aggregation</Text>
      <Text style={styles.subtitle}>Enter a set of pubkeys</Text>
      <ScrollView
        style={styles.pubkeyScrollView}
        contentContainerStyle={styles.pubkeyInputsBox}
      >
        {pubkeyInputs}
      </ScrollView>
      <AggregatedKeyDisplay pubkeys={pubkeys} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
  },
  title: {
    marginTop: 50,
    color: "white",
    fontSize: 25,
    padding: 10,
    textAlign: "center",
    justifyContent: "space-around",
  },
  subtitle: {
    color: "white",
    textAlign: "center",
    margin: 20,
  },
  pubkeyInput: {
    backgroundColor: "#555",
    borderRadius: 10,
    padding: 10,
    margin: 15,
    color: "white",
    width: 600,
    maxWidth: "100%",
    fontFamily: "monospace",
    textAlign: "center",
  },
  pubkeyScrollView: {
    flex: 5,
    maxWidth: "100%",
  },
  pubkeyInputsBox: {
    width: "90%",
    paddingBottom: 30,
  },
  aggregatedKeyDisplay: {
    margin: 40,
    height: 100,
    backgroundColor: "#444",
    padding: 10,
    width: 550,
    maxWidth: "95%",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 5,
  },
});
