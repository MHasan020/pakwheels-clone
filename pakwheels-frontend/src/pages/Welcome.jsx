import { Link } from "react-router-dom";

function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-white mb-2">
        Pak<span className="text-yellow-300">Wheels</span>
      </h1>
      <p className="text-blue-100 mb-10 text-center">
        Buy and sell cars across Pakistan. Choose how you want to continue.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 w-full max-w-2xl">
        <Link
          to="/register?role=buyer"
          className="bg-white rounded-2xl shadow-xl p-8 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-200"
        >
          <div className="text-5xl mb-3">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a Buyer</h2>
          <p className="text-gray-500 text-sm">
            Browse cars, save favorites and message sellers.
          </p>
        </Link>

        <Link
          to="/register?role=seller"
          className="bg-white rounded-2xl shadow-xl p-8 text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-200"
        >
          <div className="text-5xl mb-3">🚗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a Seller</h2>
          <p className="text-gray-500 text-sm">
            Post your car for sale and reach buyers.
          </p>
        </Link>
      </div>

      <p className="text-blue-100 mt-8 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-yellow-300 font-semibold underline">
          Login
        </Link>
        {"  •  "}
        <Link to="/" className="text-yellow-300 font-semibold underline">
          Just browse cars
        </Link>
      </p>
    </div>
  );
}

export default Welcome;