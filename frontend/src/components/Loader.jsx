// src/components/Loader.jsx
import React from "react";

const Loader = () => (
  <div className="flex items-center justify-center py-10">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
  </div>
);

export default Loader;
