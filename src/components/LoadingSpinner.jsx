export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
