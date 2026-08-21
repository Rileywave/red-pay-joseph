import LiquidBackground from "@/components/LiquidBackground";
import Logo from "@/components/Logo";
import ProfileButton from "@/components/ProfileButton";
import ActivationPanel from "@/components/ActivationPanel";

const Activate = () => {
  return (
    <div className="min-h-screen w-full relative">
      <LiquidBackground />

      <header className="relative z-10 px-3 py-2 flex items-center justify-between border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <Logo />
        <ProfileButton />
      </header>

      <main className="relative z-10 px-3 py-6 max-w-2xl mx-auto animate-fade-in">
        <ActivationPanel />
      </main>
    </div>
  );
};

export default Activate;
