const advantages = [
  "100% en français",
  "Paiement Mobile Money",
  "Prix en FCFA",
  "Résultats en secondes",
];

const SocialProof = () => {
  return (
    <section className="py-10" style={{ backgroundColor: "#080808" }}>
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
        <p className="text-white/50 text-xs sm:text-sm font-mono tracking-wide text-center">
          {advantages.map((item, i) => (
            <span key={i}>
              {item}
              {i < advantages.length - 1 && (
                <span className="mx-2 sm:mx-3 text-white/20">·</span>
              )}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
};

export default SocialProof;
