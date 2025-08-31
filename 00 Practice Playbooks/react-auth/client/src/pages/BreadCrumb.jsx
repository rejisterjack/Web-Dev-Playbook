import React from 'react';
import { Link } from 'react-router-dom';

const BreadCrumb = ({ items = [{ label: 'Home', path: '/' }] }) => {
  return (
    <nav className="flex py-3 px-5 text-gray-700 bg-gray-50 rounded-lg">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index < items.length - 1 ? (
              <>
                <Link 
                  to={item.path} 
                  className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  {item.label}
                </Link>
                <svg className="w-6 h-6 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadCrumb;