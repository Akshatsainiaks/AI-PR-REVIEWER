import { motion } from "framer-motion";

export function ScoreGauge({ score, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return "var(--color-success)";
    if (score >= 50) return "var(--color-warning)";
    return "var(--color-destructive)";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${getScoreColor()})` }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-lg font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>

        <span className="text-[10px] text-muted-foreground">
          {getScoreLabel()}
        </span>
      </div>
    </div>
  );
}