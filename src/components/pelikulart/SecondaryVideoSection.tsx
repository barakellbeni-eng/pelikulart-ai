const SecondaryVideoSection = () => {
  return (
    <section className="w-full bg-black p-0 m-0">
      <div className="relative w-full pb-[56.25%] bg-black p-0 m-0">
        <iframe
          src="https://app.videas.fr/embed/media/51fa1a49-743e-4563-aefd-50c471390ad6/?autoplay=1&loop=1&title=0&controls=0"
          title="Videas Player"
          className="absolute top-0 left-0 w-full h-full border-0 p-0 m-0 pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          tabIndex={-1}
        />
      </div>
    </section>
  );
};

export default SecondaryVideoSection;
