//📌 File: src/pages/LoginPage.jsx

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="card w-[400px]">
        <h2 className="text-2xl mb-6 text-center">Student Login</h2>

        <input className="input w-full mb-4" placeholder="Unique ID" />

        <button className="btn-primary w-full">Login</button>

        <p className="text-center mt-3">
          Not registered?{" "}
          <a href="/register" className="text-brand-primary font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
