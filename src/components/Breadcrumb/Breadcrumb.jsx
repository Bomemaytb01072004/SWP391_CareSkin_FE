import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Always render "Home" as a clickable link */}
      <a href="/" className="hover:underline">
        Home
      </a>

      {/* Render other items with the last one being active (non-clickable) */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-gray-500 text-xs"
          />
          {/* If it's not the active item, make it clickable */}
          {item.active ? (
            <span className="font-semibold">{item.label}</span>
          ) : (
            <a href={item.link} className="hover:underline">
              {item.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
