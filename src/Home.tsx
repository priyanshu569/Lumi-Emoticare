import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function Home() {
  return (
    <div style={{ padding: "20px", paddingBottom: "100px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        How are you feeling today? 😊
      </h1>

      <Card style={{ padding: "20px", marginBottom: "20px" }}>
        <p>Your current mood: Neutral 😐</p>
      </Card>

      <Button>Start Emotion Scan</Button>
    </div>
  );
}
