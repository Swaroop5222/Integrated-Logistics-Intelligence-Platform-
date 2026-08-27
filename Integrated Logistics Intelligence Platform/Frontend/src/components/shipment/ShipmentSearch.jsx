import { useState } from "react";

function ShipmentSearch({ onSearch }) {
  const [searchValue, setSearchValue] = useState("");

  function handleChange(e) {
    setSearchValue(e.target.value);
  }

  function handleSearch(e) {
    e.preventDefault();

    if (onSearch) {
      onSearch(searchValue);
    }
  }

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Enter tracking number"
        value={searchValue}
        onChange={handleChange}
      />

      <button type="submit">
        Search
      </button>
    </form>
  );
}

export default ShipmentSearch;