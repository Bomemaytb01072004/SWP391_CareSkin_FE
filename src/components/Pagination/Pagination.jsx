import React, { useState } from "react";
import "./Pagination.css";

function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = 3;

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(pageNumber)}>
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
