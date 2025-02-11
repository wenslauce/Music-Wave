const Library = () => {
  return (
    <div className="container mx-auto px-4 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Your Library</h1>
      <div className="text-center text-muted-foreground space-y-2">
        <p className="text-sm md:text-base">Your library is empty</p>
        <p className="text-sm md:text-base">Start by adding some songs or creating playlists</p>
      </div>
    </div>
  );
};

export default Library;
