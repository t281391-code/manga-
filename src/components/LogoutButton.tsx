"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="btn btn-danger min-h-0 px-3 py-2 text-sm"
    >
      Logout
    </button>
  );
}
