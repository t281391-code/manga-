export default function LogoutButton() {
  return (
    <form method="post" action="/api/auth/logout">
      <button className="btn btn-danger min-h-0 px-3 py-2 text-sm">Logout</button>
    </form>
  );
}
