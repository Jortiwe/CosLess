"use client";

import { FiSearch } from "react-icons/fi";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar",
  autoFocus = false,
}: SearchBoxProps) {
  return (
    <div className="flex h-[58px] w-full items-center border-[2px] border-[#262626] bg-white px-4 sm:h-[62px] sm:px-5 md:h-[66px]">
      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className="w-full bg-transparent text-[1rem] text-[#1f1f1f] outline-none placeholder:text-[#707070] sm:text-[1.05rem] md:text-[1.1rem]"
      />

      <button
        type="button"
        aria-label="Buscar"
        onClick={onSubmit}
        className="ml-2 flex h-9 w-9 items-center justify-center text-[#3a3a3a] transition duration-200 hover:scale-110 sm:h-10 sm:w-10"
      >
        <FiSearch className="text-[1.5rem] sm:text-[1.6rem]" />
      </button>
    </div>
  );
}