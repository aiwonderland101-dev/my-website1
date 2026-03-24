export default function IDEPage() {
  return (
    <div className="h-screen w-full">
      <iframe
        src="http://localhost:3000"
        className="h-full w-full border-0"
        title="Theia IDE"
      />
    </div>
  );
}