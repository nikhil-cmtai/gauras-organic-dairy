export default function FeaturesSection() {
  const features = [
    { icon: "🌱", title: "100% Organic", desc: "Pure and natural dairy from organic farms." },
    { icon: "🚚", title: "Fresh Delivery", desc: "Farm-fresh dairy delivered to your doorstep daily." },
    { icon: "⭐", title: "Top Quality", desc: "Premium quality trusted by thousands of families." },
    { icon: "💧", title: "Pure & Nutritious", desc: "Rich in nutrients, free from preservatives." },
  ];
  return (
    <section className="py-12 max-w-7xl mx-auto bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center border border-gray-100">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-secondary">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 