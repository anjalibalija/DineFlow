const Footer = () => {
  return (
    <footer className="bg-brown-900 text-cream-200 py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl text-gold-500 mb-4">Dine Flow</h3>
          <p className="text-sm opacity-80">
            Elevating your dining experience with AI-powered recommendations, interactive blueprints, and gamified rewards.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-gold-400">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="/restaurants" className="hover:text-gold-500 transition">Find a Restaurant</a></li>
            <li><a href="/auth" className="hover:text-gold-500 transition">Sign Up</a></li>
            <li><a href="#" className="hover:text-gold-500 transition">Our Story</a></li>
            <li><a href="#" className="hover:text-gold-500 transition">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-gold-400">Connect with us</h4>
          <p className="text-sm opacity-80 mb-4">Join our newsletter for exclusive dining deals and AI updates.</p>
          <div className="flex">
            <input type="email" placeholder="Email address" className="px-4 py-2 w-full text-brown-900 rounded-l-md outline-none" />
            <button className="bg-gold-500 text-brown-900 px-4 py-2 rounded-r-md font-bold hover:bg-gold-400 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-cream-200/20 text-center text-sm opacity-60">
        &copy; {new Date().getFullYear()} Dine Flow. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
