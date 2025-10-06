import React from "react";
import "@/sharingan.css";

interface LoadingSharinganProps {
  size?: number; // in px
}

const LoadingSharingan: React.FC<LoadingSharinganProps> = ({ size = 64 }) => {
  const style: React.CSSProperties = { width: size, height: size };
  const innerSize = Math.max(8, Math.floor(size * 0.16));
  return (
    <div className="sharingan-loader" style={style} aria-label="Loading">
      <div className="ring outer" />
      <div className="ring middle" />
      <div className="ring inner" style={{ width: innerSize, height: innerSize }} />
      <div className="tomoe t1" />
      <div className="tomoe t2" />
      <div className="tomoe t3" />
    </div>
  );
};

export default LoadingSharingan;
