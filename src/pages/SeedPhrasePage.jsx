import { useState } from "react";
import { mnemonicToSeedSync } from "@scure/bip39";
import { GenerateSeedPhrase, VerifySeedPhrase } from "../components/SeedPhrase";

export default function SeedPhrasePage({ onComplete }) {
  const [step, setStep] = useState("generate");
  const [words, setWords] = useState([]);

  const handleGenerated = (w) => {
    setWords(w);
    setStep("verify");
  };

  const handleVerified = async () => {
    try {
      const seedUint8Array = mnemonicToSeedSync(words.join(" "));
      const seedHex = Array.from(seedUint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      await fetch(
        "https://gi-chat-production.up.railway.app/api/auth/save-seed-hash",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            publicIdentifier: seedHex.slice(0, 64),
            username,
          }),
        },
      );

      setStep("done");
      onComplete?.();
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    }
  };

  if (step === "done") {
    return (
      <div style={styles.done}>
        <span style={{ fontSize: "60px" }}>🎉</span>
        <h2 style={{ color: "white", fontSize: "22px" }}>Аккаунт защищён!</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>
          Сид-фраза сохранена. Никогда не теряйте её!
        </p>
        <button style={styles.btnPrimary} onClick={onComplete}>
          Продолжить →
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {step === "generate" && (
        <GenerateSeedPhrase onComplete={handleGenerated} />
      )}
      {step === "verify" && (
        <VerifySeedPhrase
          words={words}
          onSuccess={handleVerified}
          onFail={() => setStep("generate")}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  done: {
    minHeight: "100vh",
    background: "#0f0f0f",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  btnPrimary: {
    padding: "14px 32px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #ff6584)",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
