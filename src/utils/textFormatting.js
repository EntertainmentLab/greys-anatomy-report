import React from 'react';

/**
 * Utility function to automatically italicize "Grey's Anatomy" text
 * Returns JSX with properly formatted text
 */
export const formatGreysAnatomy = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Split text by Grey's Anatomy (case insensitive) and preserve the original case
  const parts = text.split(/(Grey's Anatomy|Greys Anatomy)/gi);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === "grey's anatomy" || part.toLowerCase() === "greys anatomy") {
      return <em key={index}>Grey's Anatomy</em>;
    }
    return part;
  });
};

/**
 * Higher-order component that automatically formats Grey's Anatomy text
 */
export const withGreysAnatomyFormatting = (Component) => {
  return function FormattedComponent(props) {
    const formattedProps = { ...props };
    
    // Format common text props
    if (props.children && typeof props.children === 'string') {
      formattedProps.children = formatGreysAnatomy(props.children);
    }
    
    return <Component {...formattedProps} />;
  };
};