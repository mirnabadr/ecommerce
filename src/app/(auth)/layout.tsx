import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Dark Background */}
      <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-between p-8 md:p-12 lg:p-16 relative">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Nike Logo"
              width={32}
              height={32}
              className="brightness-0 invert"
            />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Just Do It
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-md">
            Join millions of athletes and fitness enthusiasts who trust Nike for their performance needs.
          </p>
          {/* Carousel Indicators */}
          <div className="flex space-x-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          © 2024 Nike. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Light Background */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

