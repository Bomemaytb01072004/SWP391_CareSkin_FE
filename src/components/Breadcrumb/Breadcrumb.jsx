import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex mt-6 items-center space-x-2">
      <a href="/" className="hover:underline">
        Home
      </a>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-gray-500 text-xs"
          />
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
