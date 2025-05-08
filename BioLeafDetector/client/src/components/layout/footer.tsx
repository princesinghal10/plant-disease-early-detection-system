export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-12 bg-gray-100 dark:bg-gray-800/50 py-6">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {currentYear} BioLeaf - Plant Disease Detection System</p>
      </div>
    </footer>
  );
}

export default Footer;
