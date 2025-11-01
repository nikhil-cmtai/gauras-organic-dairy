import Image from 'next/image';

export default function HeroSection() {
    return (
        <section className="relative max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-center min-h-[70vh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50">
            {/* Decorative Blobs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
            
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left relative z-10 px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Gauras Organic Dairy</h1>
                <p className="text-lg text-primary mb-2 max-w-xl font-semibold">
                  One of India&apos;s largest manufacturers of milk and dairy products
                </p>
                <p className="text-base text-foreground mb-6 max-w-xl">
                  Latest range & comprehensive variety of dairy products under the trusted brand <b>&apos;Gauras Organic Dairy&apos;</b>. Delivering fresh, nutritious, and high-quality dairy for every home.
                </p>
                <a href="#download" className="inline-block bg-secondary hover:bg-accent text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">Download Our App</a>
            </div>
            <div className="flex-1 flex justify-center relative z-10 px-4">
                <Image src="/hero.jpeg" alt="Dairy Products" className="w-full max-w-lg h-auto rounded-2xl shadow-2xl" width={500} height={500} priority />
            </div>
            {/* Wavy SVG Divider */}
            <div className="w-full absolute left-0 bottom-0 z-20 overflow-hidden -mb-1">
              <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M0,80 C480,0 960,160 1440,80 L1440,160 L0,160 Z"/>
              </svg>
            </div>
        </section>
    );
}       
