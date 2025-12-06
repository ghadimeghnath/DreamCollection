import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const features = [
  { icon: <Truck size={28} />, title: "Free Shipping", desc: "On all orders over $50" },
  { icon: <ShieldCheck size={28} />, title: "Authentic Models", desc: "100% genuine die-cast" },
  { icon: <RefreshCw size={28} />, title: "Easy Returns", desc: "30-day money back guarantee" },
  { icon: <Headphones size={28} />, title: "24/7 Support", desc: "Expert collectors support" },
];

export default function TrustSignals() {
  return (
    <section className="bg-gray-50 py-16 border-y border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600 border border-gray-100">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}