export function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(4px)",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "5px solid rgba(0,0,0,0.1)",
          borderTopColor: "#4A9EFF",
          borderRadius: "50%",
          animation: "loading-spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: 15, fontWeight: 800, color: "#4A9EFF" }}>よみこみちゅう…</p>
      <style>{`@keyframes loading-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
