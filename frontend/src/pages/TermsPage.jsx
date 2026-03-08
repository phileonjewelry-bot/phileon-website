import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen pt-24" data-testid="terms-page">
      <section className="py-16 lg:py-20 px-8 bg-phileon-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl tracking-[0.08em] text-phileon-ivory mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-invert prose-gold max-w-none space-y-8 text-phileon-ivory-muted">
            <p>
              By using the Phileon website and services, you agree to the following terms.
            </p>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">Custom Orders</h2>
              <p>
                All custom jewelry pieces are made to order. Design specifications, materials, 
                and pricing are confirmed during your consultation before production begins.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">Virtual Try-On</h2>
              <p>
                The virtual try-on feature is provided for visualization purposes only. 
                Actual jewelry may vary in appearance from the digital representation.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">Intellectual Property</h2>
              <p>
                All designs, images, and content on this website are the property of Phileon 
                and may not be reproduced without permission.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-phileon-ivory mb-4">Contact</h2>
              <p>
                For questions about these terms, please <Link to="/contact" className="text-phileon-gold hover:underline">contact us</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
