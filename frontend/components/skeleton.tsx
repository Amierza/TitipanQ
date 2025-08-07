export const Loading = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/3" />
      <div className="h-4 bg-gray-300 rounded w-full" />
      <div className="h-4 bg-gray-300 rounded w-5/6" />
      <div className="h-4 bg-gray-300 rounded w-2/3" />
    </div>
  );
};
