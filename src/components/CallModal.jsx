import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";

export default function CallModal({
  callType,
  callerName,
  isIncoming,
  socket,
  currentUser,
  currentChat,
  incomingSignal,
  onClose,
}) {
  const [callStatus, setCallStatus] = useState(
    isIncoming ? "incoming" : "calling",
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isIncoming) {
      startCall();
    }

    socket.on("call_answer", ({ signal }) => {
      peerRef.current?.signal(signal);
      setCallStatus("connected");
    });

    socket.on("call_rejected", () => {
      setCallStatus("rejected");
      setTimeout(onClose, 2000);
    });

    socket.on("call_ended", () => {
      setCallStatus("ended");
      setTimeout(onClose, 1000);
    });

    socket.on("ice_candidate", ({ candidate }) => {
      peerRef.current?.signal({ type: "candidate", candidate });
    });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
      socket.off("call_answer");
      socket.off("call_rejected");
      socket.off("call_ended");
      socket.off("ice_candidate");
    };
  }, []);

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });
    streamRef.current = stream;
    if (myVideo.current) myVideo.current.srcObject = stream;
    return stream;
  };

  const startCall = async () => {
    try {
      const stream = await getMedia();
      const peer = new SimplePeer({ initiator: true, trickle: false, stream });
      peerRef.current = peer;

      peer.on("signal", (signal) => {
        socket.emit("call_offer", {
          to: currentChat,
          from: currentUser,
          signal,
          callType,
        });
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const answerCall = async () => {
    try {
      const stream = await getMedia();
      const peer = new SimplePeer({ initiator: false, trickle: false, stream });
      peerRef.current = peer;

      peer.on("signal", (signal) => {
        socket.emit("call_answer", { to: callerName, signal });
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
      });

      peer.signal(incomingSignal);
      setCallStatus("connected");
    } catch (e) {
      console.error(e);
    }
  };

  const rejectCall = () => {
    socket.emit("reject_call", { to: callerName });
    onClose();
  };

  const endCall = () => {
    socket.emit("end_call", { to: isIncoming ? callerName : currentChat });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    onClose();
  };

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    streamRef.current
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = isCameraOff));
    setIsCameraOff(!isCameraOff);
  };

  const getColor = (name) => {
    const colors = [
      "#6c63ff",
      "#ff6584",
      "#43b89c",
      "#f7b731",
      "#fc5c65",
      "#45aaf2",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const displayName = isIncoming ? callerName : currentChat;
  const avatarBg = getColor(displayName);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Видео */}
        {callType === "video" && callStatus === "connected" && (
          <div style={styles.videoContainer}>
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              style={styles.remoteVideo}
            />
            <video
              ref={myVideo}
              autoPlay
              playsInline
              muted
              style={styles.myVideo}
            />
          </div>
        )}

        {/* Аватар при аудио звонке */}
        {(callType === "audio" || callStatus !== "connected") && (
          <div style={styles.audioContainer}>
            <div
              style={{
                ...styles.callerAvatar,
                background: avatarBg,
                boxShadow: `0 8px 30px ${avatarBg}60`,
              }}
            >
              {displayName?.slice(0, 2).toUpperCase()}
            </div>
            <h2 style={styles.callerName}>{displayName}</h2>
            <p style={styles.callStatus}>
              {callStatus === "calling" && "📞 Вызов..."}
              {callStatus === "incoming" &&
                `📞 ${callType === "video" ? "Видео" : "Аудио"} звонок`}
              {callStatus === "connected" && "🔊 Соединено"}
              {callStatus === "rejected" && "❌ Отклонено"}
              {callStatus === "ended" && "📵 Завершено"}
            </p>
          </div>
        )}

        {/* Кнопки */}
        <div style={styles.controls}>
          {callStatus === "incoming" && (
            <>
              <button
                style={{ ...styles.btn, background: "#43b89c" }}
                onClick={answerCall}
              >
                📞
              </button>
              <button
                style={{ ...styles.btn, background: "#ff4444" }}
                onClick={rejectCall}
              >
                📵
              </button>
            </>
          )}

          {callStatus === "connected" && (
            <>
              <button
                style={{
                  ...styles.btn,
                  background: isMuted ? "#ff4444" : "rgba(255,255,255,0.1)",
                }}
                onClick={toggleMute}
              >
                {isMuted ? "🔇" : "🎤"}
              </button>
              {callType === "video" && (
                <button
                  style={{
                    ...styles.btn,
                    background: isCameraOff ? "#ff4444" : "rgba(255,255,255,0.1)",
                  }}
                  onClick={toggleCamera}
                >
                  {isCameraOff ? "📵" : "📷"}
                </button>
              )}
              <button
                style={{ ...styles.btn, background: "#ff4444" }}
                onClick={endCall}
              >
                📵
              </button>
            </>
          )}

          {callStatus === "calling" && (
            <button
              style={{ ...styles.btn, background: "#ff4444" }}
              onClick={endCall}
            >
              📵
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    background: "#14141e",
    borderRadius: "24px",
    padding: "32px 24px",
    width: "360px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6)",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: "280px",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#000",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  myVideo: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "90px",
    height: "65px",
    borderRadius: "10px",
    objectFit: "cover",
    border: "2px solid #6c63ff",
  },
  audioContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  callerAvatar: {
    width: "90px",
    height: "90px",
    borderRadius: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "700",
    color: "white",
  },
  callerName: {
    color: "white",
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
  },
  callStatus: {
    color: "#888899",
    fontSize: "13px",
    margin: 0,
  },
  controls: {
    display: "flex",
    gap: "16px",
  },
  btn: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    transition: "transform 0.2s",
  },
};