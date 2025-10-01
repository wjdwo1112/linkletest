import Header from './Header';
import Footer from './Footer';

const ProfileLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileLayout;
