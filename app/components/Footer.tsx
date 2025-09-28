export default function Footer() {
  return (
    <footer className="bg-[#04090F] border-t border-[#6E6E6E]/20">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-[#F8F8F8] to-[#6E6E6E] rounded flex items-center justify-center">
              <span className="text-[#04090F] font-bold text-sm">C</span>
            </div>
            <span className="text-[#F8F8F8]/70 text-sm">ContactChronicle</span>
          </div>
          
          <div className="text-[#F8F8F8]/50 text-sm">
            Transform Your LinkedIn Connections Into Insights
          </div>
        </div>
      </div>
    </footer>
  );
}
