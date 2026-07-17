export default function UjianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 selection:bg-none">
      {/* We use selection:bg-none to slightly visually discourage selecting text, though JS is the real protector */}
      {children}
    </div>
  );
}
