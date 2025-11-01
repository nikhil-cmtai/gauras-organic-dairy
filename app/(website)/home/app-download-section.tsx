import Image from 'next/image';
import Link from 'next/link';

export default function AppDownloadSection() {
  return (
    <section id="download" className="py-16 max-w-7xl mx-auto bg-gradient-to-r from-green-50 to-amber-50 rounded-xl shadow-inner">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-primary mb-4">Download the Gauras Dairy App</h2>
          <span className="inline-block bg-secondary text-white text-xs px-3 py-1 rounded-full mb-2 animate-bounce">New!</span>
          <p className="text-lg text-foreground mb-6">Order fresh dairy products, schedule daily deliveries, and get exclusive offers—right from your phone!</p>
          <div className="flex gap-4 justify-center md:justify-start mb-2">
            <Link href="https://play.google.com/store" target="_blank" rel="noopener">
              <Image src="/playstore.webp" alt="Get it on Google Play" width={160} height={48} className="h-12 w-auto object-contain" />
            </Link>
          </div>
          <div className="text-xs text-gray-600 mt-2">10,000+ downloads • Trusted by families across India</div>
        </div>
        <div className="flex-1 flex justify-center">
          <Image src="/app1.jpeg" alt="Gauras Dairy App" className="w-64 max-w-full h-auto rounded-xl shadow-lg" width={100} height={100} />
        </div>
      </div>
    </section>
  );
} 