interface CircularBlobProps {
  size?: "sm" | "md" | "lg" | "xl";
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  opacity?: number;
}

const CircularBlob = ({
  size = "md",
  position,
  opacity = 0.6,
}: CircularBlobProps) => {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  return (
    <div
      className={`absolute ${sizeClasses[size]} bg-gradient-to-b from-purple-400 to-pink-200 rounded-full blur-sm`}
      style={{
        ...position,
        opacity,
        filter: "blur(2px)",
      }}
    />
  );
};

export default CircularBlob;
