const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="navbar">

      <input
        placeholder="Search..."
        className="search"
      />

      <div className="profile">
        <h4>{user?.name}</h4>
        <p>{user?.role}</p>
      </div>

    </div>
  );
};

export default Navbar;