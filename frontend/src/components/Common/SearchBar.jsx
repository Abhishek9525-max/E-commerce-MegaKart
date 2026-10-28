import React, { useState } from "react";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProductsByFilters,
  setFilters,
} from "../../redux/slices/productSlice";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    dispatch(fetchProductsByFilters({ search: searchTerm }));
    navigate(`/collection/all?${new URLSearchParams({ search: searchTerm })}`);
    setIsOpen(false);
  };

  return (
    <div className="shrink-0">
      <form
        onSubmit={handleSearch}
        className={`${
          isOpen
            ? "absolute inset-x-0 top-0 z-50 flex h-[76px] items-center gap-3 bg-[#F0EDE7] px-5 shadow-md"
            : "hidden lg:flex"
        }`}
      >
        <div className="relative min-w-0 flex-1 lg:w-[250px] lg:flex-none xl:w-[290px]">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#77746D]" />
          <input
            type="search"
            placeholder="Search bespoke garments..."
            aria-label="Search products"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 w-full border border-transparent bg-white/70 pl-11 pr-14 text-xs text-[#171714] outline-none transition focus:border-[#D8D2C8] focus:bg-white"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-2 top-1/2 -translate-y-1/2 border-l border-[#D8D2C8] pl-2 text-[10px] text-[#77746D]"
          >
            Search
          </button>
        </div>
        {isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close search"
            className="ml-3 text-[#77746D]"
          >
            <HiMiniXMark className="h-6 w-6" />
          </button>
        )}
      </form>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open product search"
          className="flex h-9 w-9 items-center justify-center text-[#171714] lg:hidden"
        >
          <HiMagnifyingGlass className="h-[21px] w-[21px]" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
