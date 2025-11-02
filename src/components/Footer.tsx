import logo from '@/assets/hunch-logo.png';

const Footer = ({ onJoinWaitlist }: { onJoinWaitlist: () => void }) => {
  return (
    <footer className="bg-black border-t border-white/5 py-20">
      <div className="container-custom text-center">
        <img src={logo} alt="HUNCH" className="h-10 mx-auto mb-5" />
        <p className="text-[hsl(var(--soft-gray))] text-sm">© 2025 HUNCH. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
