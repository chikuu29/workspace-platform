import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Dumbbell, Hotel, ShieldCheck } from "lucide-react";

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);
const MotionText = motion.create(Text);
const MotionHeading = motion.create(Heading);

interface SlideData {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
}

const SLIDES: SlideData[] = [
  {
    id: "ai",
    category: "AI WORKSPACE",
    title: "Intelligent AI Assistant",
    description:
      "Empower your workflow with real-time AI agents. Generate templates, automate customer support, and synthesize database queries using semantic search.",
    icon: Sparkles,
    gradientFrom: "purple.500",
    gradientTo: "pink.500",
    glowColor: "rgba(167, 139, 250, 0.15)",
  },
  {
    id: "gym",
    category: "GYM OPERATOR",
    title: "Dynamic Fitness Metrics",
    description:
      "Track athlete progressions, membership schedules, and subscription lifecycles. Get high-fidelity charts detailing member attendance and revenue flows.",
    icon: Dumbbell,
    gradientFrom: "emerald.500",
    gradientTo: "teal.500",
    glowColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "hostel",
    category: "HOSTEL BOOKING",
    title: "Spatial Occupancy Grids",
    description:
      "Manage real-time lodging occupancy, automate check-ins, and secure keyless access controls for rooms and beds using live spatial visualization.",
    icon: Hotel,
    gradientFrom: "blue.500",
    gradientTo: "cyan.500",
    glowColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "policy",
    category: "COMPLIANCE & GUARD",
    title: "Enterprise Security Shield",
    description:
      "Enforce fine-grained, role-based security policies. Safeguard client credentials, manage logs, and configure access levels on an encrypted compliance ledger.",
    icon: ShieldCheck,
    gradientFrom: "amber.500",
    gradientTo: "red.500",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
];

// Sub-component: AI Assistant Animated SVG
const AiAssistantSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 280" fill="none">
    {/* Grid Background */}
    <defs>
      <pattern id="grid-pattern-ai" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
      </pattern>
      <linearGradient id="ai-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-pattern-ai)" rx="16" />

    {/* Decorative Glowing Orb in Center */}
    <circle cx="200" cy="140" r="80" fill="url(#ai-glow-grad)" filter="blur(16px)" />

    {/* Center Brain Core / Orbit Lines */}
    <motion.circle
      cx="200"
      cy="140"
      r="45"
      stroke="rgba(167, 139, 250, 0.3)"
      strokeWidth="1.5"
      strokeDasharray="5 5"
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    <motion.circle
      cx="200"
      cy="140"
      r="60"
      stroke="rgba(99, 102, 241, 0.2)"
      strokeWidth="1"
      strokeDasharray="10 5"
      animate={{ rotate: -360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />

    {/* Network Nodes */}
    <motion.circle
      cx="200"
      cy="80"
      r="4"
      fill="#a78bfa"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="260"
      cy="140"
      r="4"
      fill="#818cf8"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="200"
      cy="200"
      r="4"
      fill="#f472b6"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="140"
      cy="140"
      r="4"
      fill="#6366f1"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Connection Lines to Core */}
    <line x1="200" y1="80" x2="200" y2="140" stroke="rgba(167, 139, 250, 0.2)" strokeWidth="1.5" />
    <line x1="260" y1="140" x2="200" y2="140" stroke="rgba(129, 140, 248, 0.2)" strokeWidth="1.5" />
    <line x1="200" y1="200" x2="200" y2="140" stroke="rgba(244, 114, 182, 0.2)" strokeWidth="1.5" />
    <line x1="140" y1="140" x2="200" y2="140" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />

    {/* AI Badge inside Brain Core */}
    <motion.g
      initial={{ scale: 0.9 }}
      animate={{ scale: [0.9, 1.05, 0.9] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="200" cy="140" r="24" fill="rgba(167, 139, 250, 0.15)" stroke="#a78bfa" strokeWidth="2" />
      {/* Lucide Sparkles replacement inside */}
      <path
        d="M 200 130 C 200 135, 195 140, 190 140 C 195 140, 200 145, 200 150 C 200 145, 205 140, 210 140 C 205 140, 200 135, 200 130 Z"
        fill="#a78bfa"
      />
    </motion.g>

    {/* Floating Chat Bubble User (Left Side) */}
    <motion.g
      initial={{ x: -30, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
    >
      {/* Bubble Container */}
      <rect x="25" y="45" width="130" height="42" rx="12" fill="#1e1b4b" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
      <polygon points="155,60 160,65 155,70" fill="#1e1b4b" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />
      {/* Hide overlay border on overlap */}
      <polygon points="154,58 156,65 154,72" fill="#1e1b4b" />
      {/* Text Lines */}
      <rect x="37" y="56" width="90" height="6" rx="3" fill="#a78bfa" opacity="0.9" />
      <rect x="37" y="69" width="60" height="6" rx="3" fill="rgba(167, 139, 250, 0.5)" />
    </motion.g>

    {/* Floating Chat Bubble AI (Right Side) */}
    <motion.g
      initial={{ x: 30, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 1.0, duration: 0.6, type: "spring" }}
    >
      {/* Bubble Container */}
      <rect x="235" y="180" width="140" height="52" rx="12" fill="#0b1437" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
      <polygon points="235,195 230,200 235,205" fill="#0b1437" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
      <polygon points="236,193 234,200 236,207" fill="#0b1437" />
      {/* Sparkle and Text Lines */}
      <circle cx="253" cy="206" r="8" fill="rgba(99, 102, 241, 0.2)" />
      <path d="M 253 202 L 253 210 M 249 206 L 257 206" stroke="#818cf8" strokeWidth="1.5" />
      <rect x="270" y="193" width="90" height="6" rx="3" fill="#818cf8" />
      <rect x="270" y="205" width="75" height="6" rx="3" fill="#cbd5e1" opacity="0.8" />
      <rect x="270" y="217" width="45" height="6" rx="3" fill="rgba(99, 102, 241, 0.5)" />
    </motion.g>

    {/* Sparkle particle floating */}
    <motion.path
      d="M 120 190 Q 120 195, 115 195 Q 120 195, 120 200 Q 120 195, 125 195 Q 120 195, 120 190 Z"
      fill="#f472b6"
      animate={{
        y: [0, -12, 0],
        opacity: [0.3, 1, 0.3],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path
      d="M 310 70 Q 310 74, 306 74 Q 310 74, 310 78 Q 310 74, 314 74 Q 310 74, 310 70 Z"
      fill="#a78bfa"
      animate={{
        y: [0, -15, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [0.7, 1.1, 0.7],
      }}
      transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

// Sub-component: Gym Operations Animated SVG
const GymOperationsSvg = () => {
  const pulseVariants = {
    animate: {
      pathLength: [0, 1],
      pathOffset: [0, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear" as const,
      },
    },
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 280" fill="none">
      <defs>
        <pattern id="grid-pattern-gym" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        </pattern>
        <linearGradient id="gym-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern-gym)" rx="16" />

      {/* Main Glassmorphic Grid Panel inside SVG */}
      <rect x="30" y="30" width="340" height="220" rx="12" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />

      {/* Left Widget: Circular Goal Ring */}
      <g transform="translate(45, 50)">
        <rect width="120" height="180" rx="10" fill="#0b1437" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />

        {/* Goal Circle Background */}
        <circle cx="60" cy="75" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />

        {/* Active Progress Circle */}
        <motion.circle
          cx="60"
          cy="75"
          r="38"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="238"
          initial={{ strokeDashoffset: 238 }}
          animate={{ strokeDashoffset: 60 }} // ~75% filled
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />

        <text x="60" y="80" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
          75%
        </text>
        <text x="60" y="135" textAnchor="middle" fill="#8f9bba" fontSize="10" fontWeight="bold">
          ATTENDANCE
        </text>
        <text x="60" y="152" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
          +12% Today
        </text>
      </g>

      {/* Right Widget: Telemetry / Live Revenue Chart */}
      <g transform="translate(185, 50)">
        <rect width="170" height="180" rx="10" fill="#0b1437" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {/* Chart Axis Grid */}
        <line x1="20" y1="130" x2="150" y2="130" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        <line x1="20" y1="90" x2="150" y2="90" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
        <line x1="20" y1="50" x2="150" y2="50" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />

        {/* Bar 1 */}
        <motion.rect
          x="35"
          width="16"
          fill="url(#gym-bar-grad)"
          rx="3"
          initial={{ height: 0, y: 130 }}
          animate={{ height: 60, y: 70 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        />

        {/* Bar 2 */}
        <motion.rect
          x="65"
          width="16"
          fill="url(#gym-bar-grad)"
          rx="3"
          initial={{ height: 0, y: 130 }}
          animate={{ height: 90, y: 40 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />

        {/* Bar 3 */}
        <motion.rect
          x="95"
          width="16"
          fill="url(#gym-bar-grad)"
          rx="3"
          initial={{ height: 0, y: 130 }}
          animate={{ height: 75, y: 55 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />

        {/* Bar 4 */}
        <motion.rect
          x="125"
          width="16"
          fill="url(#gym-bar-grad)"
          rx="3"
          initial={{ height: 0, y: 130 }}
          animate={{ height: 110, y: 20 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
        />

        {/* Heart Rate / Waveform at the Bottom */}
        <g transform="translate(15, 140)">
          {/* Wave Path */}
          <path
            d="M 5 15 L 25 15 L 35 5 L 43 28 L 51 0 L 59 20 L 67 15 L 135 15"
            fill="none"
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth="1.5"
          />
          {/* Animated Glowing Pulse */}
          <motion.path
            d="M 5 15 L 25 15 L 35 5 L 43 28 L 51 0 L 59 20 L 67 15 L 135 15"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            variants={pulseVariants}
            animate="animate"
          />
          <text x="140" y="19" fill="#10b981" fontSize="9" fontWeight="bold" letterSpacing="0.5">
            78 BPM
          </text>
        </g>
      </g>
    </svg>
  );
};

// Sub-component: Hostel Booking Animated SVG
const HostelBookingSvg = () => {
  const scanVariants = {
    animate: {
      y: [20, 160, 20],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const beds = [
    { x: 50, y: 45, status: "occupied", delay: 0 },
    { x: 135, y: 45, status: "available", delay: 0.2 },
    { x: 220, y: 45, status: "occupied", delay: 0.4 },
    { x: 50, y: 115, status: "available", delay: 0.6 },
    { x: 135, y: 115, status: "occupied", delay: 0.8 },
    { x: 220, y: 115, status: "available", delay: 1.0 },
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 280" fill="none">
      <defs>
        <pattern id="grid-pattern-hostel" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        </pattern>
        <linearGradient id="scan-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern-hostel)" rx="16" />

      {/* Main Grid Occupancy Dashboard Layout */}
      <g transform="translate(45, 30)">
        <rect width="310" height="220" rx="12" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />

        {/* Title Inside Widget */}
        <text x="20" y="25" fill="#8f9bba" fontSize="10" fontWeight="bold" letterSpacing="1">
          SPATIAL MAP: DORM B
        </text>

        {/* Render Beds */}
        {beds.map((bed, index) => (
          <g key={index} transform={`translate(${bed.x}, ${bed.y})`}>
            {/* Bed Card Container */}
            <rect
              width="70"
              height="55"
              rx="6"
              fill="#0b1437"
              stroke={bed.status === "occupied" ? "rgba(255,255,255,0.06)" : "rgba(59, 130, 246, 0.25)"}
              strokeWidth="1"
            />

            {/* Bed Silhouette */}
            <rect x="10" y="16" width="50" height="20" rx="2" fill="rgba(255, 255, 255, 0.03)" />
            <rect x="10" y="8" width="50" height="6" rx="1" fill="rgba(255, 255, 255, 0.05)" />
            <rect x="14" y="10" width="14" height="3" rx="0.5" fill="rgba(255, 255, 255, 0.1)" />

            {/* Status Dot */}
            <motion.circle
              cx="56"
              cy="11"
              r="3.5"
              fill={bed.status === "occupied" ? "#ef4444" : "#3b82f6"}
              animate={{
                opacity: bed.status === "occupied" ? 0.7 : [0.4, 1, 0.4],
                scale: bed.status === "occupied" ? 1 : [0.9, 1.2, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: bed.delay,
                ease: "easeInOut",
              }}
            />

            <text x="35" y="46" textAnchor="middle" fill={bed.status === "occupied" ? "#707eae" : "#3b82f6"} fontSize="8" fontWeight="bold">
              {bed.status === "occupied" ? "OCCUPIED" : "VACANT"}
            </text>
          </g>
        ))}

        {/* Live scanning bar effect */}
        <motion.rect
          x="5"
          width="300"
          initial={{ height: 16 }}
          fill="url(#scan-grad)"
          variants={scanVariants}
          animate="animate"
          pointerEvents="none"
        />

        {/* Keyless Verification Notification Badge */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
          transform="translate(80, 175)"
        >
          <rect width="150" height="34" rx="17" fill="#1e293b" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1.5" />
          {/* Keyless verify lock icon */}
          <circle cx="20" cy="17" r="8" fill="rgba(59, 130, 246, 0.2)" />
          <path d="M 18 17 L 22 17 M 20 15 L 20 19" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          <text x="35" y="21" fill="#fff" fontSize="9" fontWeight="bold">
            Smart Key Checked In
          </text>
          <motion.circle
            cx="135"
            cy="17"
            r="3"
            fill="#10b981"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.g>
      </g>
    </svg>
  );
};

// Sub-component: Security Shield Animated SVG
const SecurityShieldSvg = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 280" fill="none">
      <defs>
        <pattern id="grid-pattern-sec" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        </pattern>
        <radialGradient id="sec-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern-sec)" rx="16" />

      {/* Decorative Radial Security Glow */}
      <circle cx="200" cy="140" r="100" fill="url(#sec-glow)" filter="blur(16px)" />

      {/* Outer Encrypted Lock Rings */}
      <motion.circle
        cx="200"
        cy="140"
        r="80"
        stroke="rgba(245, 158, 11, 0.15)"
        strokeWidth="2"
        strokeDasharray="40 10 5 10"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        cx="200"
        cy="140"
        r="68"
        stroke="rgba(239, 68, 68, 0.2)"
        strokeWidth="1.5"
        strokeDasharray="15 30 10 15"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Connection Node Lattice (Encrypted Ledger Lines) */}
      <path
        d="M 120 70 L 160 140 L 120 210 M 280 70 L 240 140 L 280 210 M 160 140 L 240 140"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1.5"
      />

      {/* Lattice Endpoint Nodes */}
      <circle cx="120" cy="70" r="4" fill="#ef4444" />
      <circle cx="120" cy="210" r="4" fill="#f59e0b" />
      <circle cx="280" cy="70" r="4" fill="#f59e0b" />
      <circle cx="280" cy="210" r="4" fill="#ef4444" />

      {/* Shield Vector Representation */}
      <g transform="translate(165, 95)">
        <motion.path
          d="M 35 0 C 35 0, 70 10, 70 30 C 70 65, 35 85, 35 85 C 35 85, 0 65, 0 30 C 0 10, 35 0, 35 0 Z"
          fill="#0b1437"
          stroke="#f59e0b"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Lock Emblem Inside Shield */}
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          transform="translate(23, 27)"
        >
          {/* Shackle */}
          <path
            d="M 7 12 L 7 7 C 7 3, 17 3, 17 7 L 17 12"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Lock Body */}
          <rect y="11" width="24" height="18" rx="4" fill="#f59e0b" />
          {/* Keyhole */}
          <circle cx="12" cy="18" r="2.5" fill="#0b1437" />
          <path d="M 12 20.5 L 12 25" stroke="#0b1437" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </g>

      {/* Verification Checkmarks on Compliance Ledger */}
      <motion.g
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        transform="translate(25, 220)"
      >
        <rect width="115" height="26" rx="6" fill="#0b1437" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
        <circle cx="15" cy="13" r="6" fill="rgba(16, 185, 129, 0.2)" />
        <path d="M 12 13 L 14 15 L 18 11" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <text x="28" y="16.5" fill="#cbd5e1" fontSize="8" fontWeight="bold">
          SOC-2 Compliant
        </text>
      </motion.g>

      <motion.g
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        transform="translate(260, 34)"
      >
        <rect width="110" height="26" rx="6" fill="#0b1437" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" />
        <circle cx="15" cy="13" r="6" fill="rgba(16, 185, 129, 0.2)" />
        <path d="M 12 13 L 14 15 L 18 11" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <text x="28" y="16.5" fill="#cbd5e1" fontSize="8" fontWeight="bold">
          SSL Enforced
        </text>
      </motion.g>
    </svg>
  );
};

export const MarketingShowcase: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Auto-rotating slides effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const selectSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const slideData = useMemo(() => SLIDES[currentSlide], [currentSlide]);

  const renderActiveSvg = (id: string) => {
    switch (id) {
      case "ai":
        return <AiAssistantSvg />;
      case "gym":
        return <GymOperationsSvg />;
      case "hostel":
        return <HostelBookingSvg />;
      case "policy":
        return <SecurityShieldSvg />;
      default:
        return null;
    }
  };

  const navItemHover = { scale: 1.05 };

  return (
    <Stack
      gap={8}
      w="full"
      h="full"
      justifyContent="center"
      position="relative"
      px={{ base: 4, lg: 8 }}
      py={8}
    >
      {/* Decorative Orbs behind the Marketing Showcase */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={slideData.id + "-orb"}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="380px"
          h="380px"
          borderRadius="full"
          bg={slideData.glowColor}
          filter="blur(80px)"
          zIndex="0"
          pointerEvents="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>



      {/* Main Glassmorphic Animated SVG Panel */}
      <MotionBox
        zIndex="1"
        p={5}
        borderRadius="3xl"
        bg="whiteAlpha.50"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.4)"
        position="relative"
        overflow="hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          h={{ base: "240px", md: "280px" }}
          w="full"
          bg="navy.900"
          borderRadius="2xl"
          overflow="hidden"
          border="1px solid"
          borderColor="whiteAlpha.50"
          mb={6}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={slideData.id}
              w="full"
              h="full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {renderActiveSvg(slideData.id)}
            </MotionBox>
          </AnimatePresence>
        </Flex>

        {/* Feature Details Content (Auto-updated) */}
        <Stack gap={2} minH="110px">
          <AnimatePresence mode="wait">
            <MotionBox
              key={slideData.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <Text
                fontSize="xs"
                fontWeight="800"
                letterSpacing="widest"
                bgGradient="to-r"
                gradientFrom={slideData.gradientFrom}
                gradientTo={slideData.gradientTo}
                bgClip="text"
                textTransform="uppercase"
                mb={1}
              >
                {slideData.category}
              </Text>
              <MotionHeading
                fontSize="xl"
                fontWeight="800"
                color="white"
                mb={2}
                letterSpacing="tight"
              >
                {slideData.title}
              </MotionHeading>
              <MotionText
                fontSize="sm"
                color="secondaryGray.500"
                lineHeight="tall"
                fontWeight="500"
              >
                {slideData.description}
              </MotionText>
            </MotionBox>
          </AnimatePresence>
        </Stack>
      </MotionBox>

      {/* Manual Selection Tabs / Indicators */}
      <Flex zIndex="1" gap={3} mt={2} align="center" justify="center">
        {SLIDES.map((slide, idx) => {
          const IconComponent = slide.icon;
          const isActive = idx === currentSlide;
          return (
            <MotionBox
              key={slide.id}
              whileHover={navItemHover}
              onClick={() => selectSlide(idx)}
              cursor="pointer"
              position="relative"
            >
              <Flex
                align="center"
                justify="center"
                h="10"
                w={isActive ? "32" : "10"}
                borderRadius="full"
                border="1px solid"
                borderColor={isActive ? "brand.400" : "whiteAlpha.100"}
                bg={isActive ? "rgba(117, 81, 255, 0.15)" : "whiteAlpha.50"}
                transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                gap={2}
                px={isActive ? 4 : 0}
              >
                <IconComponent
                  size={16}
                  color={isActive ? "#a78bfa" : "#a3aed0"}
                  style={{ transition: "color 0.3s" }}
                />
                {isActive && (
                  <Text
                    fontSize="xs"
                    fontWeight="800"
                    color="white"
                    whiteSpace="nowrap"
                  >
                    {slide.id.toUpperCase()}
                  </Text>
                )}
              </Flex>
            </MotionBox>
          );
        })}
      </Flex>
    </Stack>
  );
};

export default React.memo(MarketingShowcase);
