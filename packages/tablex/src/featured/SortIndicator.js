import React from "react";

const Asc = () => {
  return (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="arrow-up"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M868 545.5L536.1 163a31.96 31.96 0 0 0-48.3 0L156 545.5a7.97 7.97 0 0 0 6 13.2h81c4.6 0 9-2 12.1-5.5L474 300.9V864c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V300.9l218.9 252.3c3 3.5 7.4 5.5 12.1 5.5h81c6.8 0 10.5-8 6-13.2z" />
    </svg>
  );
};

const Desc = () => {
  return (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="arrow-down"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M862 465.3h-81c-4.6 0-9 2-12.1 5.5L550 723.1V160c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v563.1L255.1 470.8c-3-3.5-7.4-5.5-12.1-5.5h-81c-6.8 0-10.5 8.1-6 13.2L487.9 861a31.96 31.96 0 0 0 48.3 0L868 478.5c4.5-5.2.8-13.2-6-13.2z" />
    </svg>
  );
};

const SortIcon = ({ order = "" }) => {
  let indicator = "";
  if (order === "asc") {
    indicator = <Asc />;
  } else if (order === "desc") {
    indicator = <Desc />;
  }

  return (
    <span
      className="tablex-column-sort-indicator"
      style={{ color: "#ccc", fontSize: 12, verticalAlign: "middle",marginLeft:5 }}
    >
      {indicator}
    </span>
  );
};

export default SortIcon;
