import Footer from "@/components/(website)/Footer";
import Header from "@/components/(website)/Header";
import { Noto_Sans } from 'next/font/google';

  const notoSans = Noto_Sans({
  subsets: ['latin'], 
  weight: ['400', '500', '700', '900'], 
  variable: '--font-noto-sans', 
  display: 'swap',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className={`min-h-screen bg-white font-sans overflow-x-hidden ${notoSans.className}`}>
        <Header />
      <div className="flex flex-col">
        <main className="w-full px-4 ">
          {children}
        </main>
      <Footer />
      </div>
    </div>
  );
}

