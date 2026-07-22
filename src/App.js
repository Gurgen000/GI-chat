import { useEffect, useState } from "react";
import useStore from "./store/useStore";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import SeedPhrasePage from "./pages/SeedPhrasePage";


function App() {
  const { user, setUser } = useStore();
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (username && token) {
      setUser({ username }, token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {!user && <Auth />}
      {user && !seedDone && (
        <SeedPhrasePage onComplete={() => setSeedDone(true)} />
      )}
      {user && seedDone && <Chat />}
    </div>
  );
}

export default App;
