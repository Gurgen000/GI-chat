import { useState, useCallback } from "react";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from '@scure/bip39/wordlists/english.js'

// Шаг 1 — Генерация
export function GenerateSeedPhrase({ onComplete }) {
  const [words, setWords] = useState([]);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const mnemonic = generateMnemonic(wordlist, 256); // 24 слова
    setWords(mnemonic.split(" "));
    setShown(false);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(words.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Сид-фраза</h2>
      <p style={styles.desc}>
        Это 24 слова — ключ к вашему аккаунту. Запишите их и никому не
        показывайте!
      </p>

      {words.length === 0 ? (
        <button style={styles.btnPrimary} onClick={generate}>
          Сгенерировать фразу
        </button>
      ) : (
        <>
          <div style={styles.wordsGrid}>
            {words.map((word, i) => (
              <div key={i} style={styles.wordItem}>
                <span style={styles.wordNum}>{i + 1}</span>
                <span style={styles.wordText}>{shown ? word : "••••••"}</span>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button
              style={styles.btnSecondary}
              onClick={() => setShown(!shown)}
            >
              {shown ? "🙈 Скрыть" : "👁 Показать"}
            </button>
            <button style={styles.btnSecondary} onClick={copy}>
              {copied ? "✅ Скопировано!" : "📋 Копировать"}
            </button>
          </div>

          <div style={styles.warning}>
            ⚠️ Никогда не делитесь этой фразой! Кто знает её — контролирует ваш
            аккаунт.
          </div>

          <button style={styles.btnPrimary} onClick={() => onComplete(words)}>
            Я сохранил фразу →
          </button>
        </>
      )}
    </div>
  );
}

// Шаг 2 — Проверка
export function VerifySeedPhrase({ words, onSuccess, onFail }) {
  // Просим ввести 3 случайных слова
  const [indices] = useState(() => {
    const picked = new Set();
    while (picked.size < 3) {
      picked.add(Math.floor(Math.random() * 24));
    }
    return Array.from(picked).sort((a, b) => a - b);
  });

  const [inputs, setInputs] = useState(["", "", ""]);
  const [error, setError] = useState("");

  const verify = () => {
    const allCorrect = indices.every(
      (wordIndex, i) =>
        inputs[i].trim().toLowerCase() === words[wordIndex].toLowerCase(),
    );
    if (allCorrect) {
      onSuccess();
    } else {
      setError("❌ Неверные слова! Проверь ещё раз.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✅ Проверка</h2>
      <p style={styles.desc}>
        Введи слова под указанными номерами чтобы подтвердить что ты их
        сохранил.
      </p>

      {indices.map((wordIndex, i) => (
        <div key={i} style={styles.verifyItem}>
          <label style={styles.verifyLabel}>Слово #{wordIndex + 1}</label>
          <input
            style={styles.verifyInput}
            value={inputs[i]}
            onChange={(e) => {
              const newInputs = [...inputs];
              newInputs[i] = e.target.value;
              setInputs(newInputs);
              setError("");
            }}
            placeholder={`Введи слово #${wordIndex + 1}`}
          />
        </div>
      ))}

      {error && <p style={styles.error}>{error}</p>}

      <button style={styles.btnPrimary} onClick={verify}>
        Подтвердить
      </button>

      <button style={styles.btnBack} onClick={onFail}>
        ← Назад к фразе
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px",
    background: "#141414",
    borderRadius: "20px",
    border: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  title: {
    color: "white",
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
    textAlign: "center",
  },
  desc: {
    color: "#888",
    fontSize: "14px",
    textAlign: "center",
    lineHeight: "1.5",
    margin: 0,
  },
  wordsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
  },
  wordItem: {
    background: "#1e1e2e",
    borderRadius: "8px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  wordNum: {
    color: "#6c63ff",
    fontSize: "10px",
    fontWeight: "600",
  },
  wordText: {
    color: "white",
    fontSize: "12px",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  warning: {
    background: "rgba(255, 101, 132, 0.1)",
    border: "1px solid rgba(255, 101, 132, 0.3)",
    borderRadius: "10px",
    padding: "12px",
    color: "#ff6584",
    fontSize: "13px",
    textAlign: "center",
  },
  btnPrimary: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #ff6584)",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSecondary: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "13px",
  },
  verifyItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  verifyLabel: {
    color: "#6c63ff",
    fontSize: "13px",
    fontWeight: "600",
  },
  verifyInput: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    background: "#1a1a1a",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  error: {
    color: "#ff6584",
    fontSize: "13px",
    textAlign: "center",
    margin: 0,
  },
  btnBack: {
    background: "transparent",
    border: "none",
    color: "#888",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "center",
  },
};
