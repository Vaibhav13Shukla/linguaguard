// ALSO INTENTIONALLY HAS HARDCODED STRINGS

export function Pricing() {
  return (
    <section className="py-16">
      <h2 className="text-center text-3xl font-bold">Simple, Transparent Pricing</h2>
      <p className="mt-2 text-center text-gray-600">Choose the plan that works for you</p>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-6">
        <div className="rounded-xl border p-6">
          <h3 className="text-lg font-bold">Free</h3>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <p className="text-sm text-gray-500">per month</p>
          <button className="mt-4 w-full rounded-lg bg-gray-100 py-2">Get Started</button>
        </div>
        <div className="rounded-xl border-2 border-blue-600 p-6">
          <h3 className="text-lg font-bold">Pro</h3>
          <p className="mt-2 text-3xl font-bold">$29</p>
          <p className="text-sm text-gray-500">per month</p>
          <button className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white">
            Subscribe Now
          </button>
        </div>
      </div>
    </section>
  );
}
