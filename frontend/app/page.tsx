import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { GraduationCap, Users, Clock, ShieldCheck } from "lucide-react";

export default function Home() {
  const features = [
    {
      name: 'சிறந்த கல்வி (Quality Education)',
      description: 'அனுபவம் வாய்ந்த பட்டதாரி ஆசிரியர்களால் நவீன கற்பித்தல் முறைகள் மூலம் கல்வி புகட்டப்படுகிறது.',
      icon: GraduationCap,
      color: 'bg-blue-500',
    },
    {
      name: 'தனிப்பட்ட கவனம் (Individual Attention)',
      description: 'ஒவ்வொரு மாணவரின் மீதும் தனிப்பட்ட கவனம் செலுத்தி அவர்களின் கற்றல் குறைபாடுகள் நிவர்த்தி செய்யப்படும்.',
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      name: 'நவீன வசதிகள் (Modern Facilities)',
      description: 'அமைதியான சூழல், நவீன வகுப்பறைகள் மற்றும் தொழில்நுட்ப வசதிகள் மாணவர்களின் கற்றலை எளிதாக்கும்.',
      icon: Clock, // Using Clock just as a placeholder, maybe Monitor would be better but Lucide naming varies
      color: 'bg-purple-500',
    },
    {
      name: 'பாதுகாப்பான சூழல் (Secure Environment)',
      description: 'மாணவர்களின் பாதுகாப்பை உறுதி செய்யும் வகையில் சிசிடிவி கண்காணிப்பு மற்றும் பாதுகாப்பு ஏற்பாடுகள்.',
      icon: ShieldCheck,
      color: 'bg-orange-500',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-emerald-600 font-bold tracking-wide uppercase">ஏன் எம்மைத் தெரிவு செய்ய வேண்டும்?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              மாணவர்களின் எதிர்காலமே எமது <span className="text-emerald-600">முதலீடு</span>
            </p>
            <p className="mt-4 text-xl text-gray-500">
              கல்வி கற்பதல்ல, கற்றதை தெளிவாகவும் ஆழமாகவும் புரிந்துகொள்வதே உண்மையான கல்வி.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative group bg-white p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100">
                <div className="mb-6">
                  <span className={`inline-flex items-center justify-center p-3 rounded-lg shadow-lg ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision/Mission Compact */}
      <section className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 border-l-4 border-emerald-400 pl-4">எமது நோக்கம் (Vision)</h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                "சிறந்த கல்வியை அனைவருக்கும் சாத்தியமாக்குதல் மற்றும் எதிர்கால தலைமுறையை அறிவு, ஆற்றல் மற்றும் ஒழுக்கத்துடன் உருவாக்குதல்."
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 border-l-4 border-emerald-400 pl-4">எமது குறிக்கோள் (Mission)</h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                "மாணவர்களின் தனித்துவத்தை கண்டறிந்து, அவர்களின் திறமைகளை வளர்த்து, சமூகத்திற்கு பயனுள்ள சிறந்த பிரஜைகளாக உருவாக்குதல்."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-emerald-500 font-bold text-lg mb-4">அகரம் உயர்நிலைக் கல்லூரி</h3>
              <p className="text-sm">தரமான கல்விக்கான உத்தரவாதம்.</p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">தொடர்புகளுக்கு</h3>
              <p className="text-sm">எண் 123, பிரதான வீதி, யாழ்ப்பாணம்</p>
              <p className="text-sm mt-2">+94 77 123 4567</p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">இணைப்புகள்</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-emerald-400">முகப்பு</a></li>
                <li><a href="#" className="hover:text-emerald-400">பாடநெறிகள்</a></li>
                <li><a href="#" className="hover:text-emerald-400">நுழைவு</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Aharam High Standard College. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
