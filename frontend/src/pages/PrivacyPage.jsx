import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="privacy-page">
      <section className="py-16 lg:py-20 px-8 bg-phileon-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl tracking-[0.08em] text-phileon-ivory mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-invert prose-gold max-w-none space-y-8 text-phileon-ivory-muted">
            <p>
              At Phileon, we respect your privacy and are committed to protecting your personal information.
            </p>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">Information We Collect</h2>
              <p>
                We collect information you provide directly, such as your name, email address, 
                phone number, and design preferences when you submit inquiries or consultation requests.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">How We Use Your Information</h2>
              <p>
                Your information is used solely to respond to your inquiries, schedule consultations, 
                and create your custom jewelry pieces. We do not sell or share your personal information 
                with third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">Contact</h2>
              <p>
                For questions about our privacy practices, please <Link to="/contact" className="text-phileon-gold hover:underline">contact us</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
