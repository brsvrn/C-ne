import React from 'react';
import { C } from "../utils/theme";

export default function SkeletonCard() {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", flexShrink: 0, width: 130 }}>
      <div className="shimmer-bg" style={{ height: 195, borderRadius: 10 }} />
      <div className="shimmer-bg" style={{ height: 12, borderRadius: 4, margin: "8px 2px 4px" }} />
      <div className="shimmer-bg" style={{ height: 10, borderRadius: 4, margin: "0 2px", width: "60%" }} />
    </div>
  );
}
