// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This tells metro to load .wasm files as image-like file assets
// when loaded via 'import' statements.
config.resolver.assetExts.push("wasm");

module.exports = config;
