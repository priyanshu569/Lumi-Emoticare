import { Home, Camera, Sparkles, BarChart3, Settings } from "lucide-react";

const items = [
  { label: "Home", icon: Home },
  { label: "Scan", icon: Camera },
  { label: "Support", icon: Sparkles },
  { label: "Mood", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "420px",
        background: "#111",
        borderRadius: "30px",
        padding: "10px",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      {items.map(({ label, icon: Icon }) => (
        <div
          key={label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "white",
            fontSize: "12px",
          }}
        >
          <Icon size={20} />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
}
