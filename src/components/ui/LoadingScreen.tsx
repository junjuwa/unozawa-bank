export function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "4px solid rgba(0,0,0,0.08)",
          borderTopColor: "currentColor",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          opacity: 0.5,
        }}
      />
      <p style={{ fontSize: 13, fontWeight: 700, opacity: 0.5 }}>よみこみちゅう…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
