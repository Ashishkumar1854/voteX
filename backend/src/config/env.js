// src/config/env.js
const get = (key, fallback = undefined) => process.env[key] ?? fallback;
module.exports = { get };
