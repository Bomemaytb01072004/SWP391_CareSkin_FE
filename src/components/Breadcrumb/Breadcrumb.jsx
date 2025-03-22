import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="flex mt-6 items-center space-x-2">
      <span
        className="hover:underline cursor-pointer"
        onClick={() => navigate('/')}
      >
        Home
      </span>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-gray-500 text-xs"
          />
          {item.active ? (
            <span className="font-semibold">{item.label}</span>
          ) : (
            <span
              className="hover:underline cursor-pointer"
              onClick={() => navigate(item.link)}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
