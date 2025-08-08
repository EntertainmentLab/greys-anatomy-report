/**
 * Utility function to automatically format text in the DOM
 * This function applies multiple formatting rules:
 * 1. Italicizes "Grey's Anatomy" text
 * 2. Italicizes text within quotation marks (keeping the quotes)
 */
export const formatTextInDOM = () => {
  const textNodes = [];
  
  // Function to find all text nodes in the document
  const getTextNodes = (node) => {
    if (node.nodeType === 3) { // Text node
      textNodes.push(node);
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        getTextNodes(node.childNodes[i]);
      }
    }
  };
  
  // Get all text nodes in the document
  getTextNodes(document.body);
  
  // Process each text node
  textNodes.forEach(node => {
    const text = node.nodeValue;
    let formattedText = text;
    let hasChanges = false;
    
    // Rule 1: Italicize Grey's Anatomy
    const greysRegex = /Grey's Anatomy|Greys Anatomy/gi;
    if (greysRegex.test(text)) {
      formattedText = formattedText.replace(greysRegex, '<em>Grey\'s Anatomy</em>');
      hasChanges = true;
    }
    
    // Rule 2: Italicize text within quotation marks (keeping the quotes)
    // Use a more precise regex approach to handle multiple quoted sections
    const quotesRegex = /"([^"]+)"/g;
    let match;
    let lastIndex = 0;
    let newText = '';
    
    // Process each quoted section individually
    while ((match = quotesRegex.exec(formattedText)) !== null) {
      // Add text before the quote
      newText += formattedText.substring(lastIndex, match.index);
      // Add the quote with italicized content
      newText += '"<em>' + match[1] + '</em>"';
      lastIndex = quotesRegex.lastIndex;
    }
    
    // Add any remaining text after the last quote
    if (lastIndex < formattedText.length) {
      newText += formattedText.substring(lastIndex);
    }
    
    // Only update if we actually made changes
    if (newText && newText !== formattedText) {
      formattedText = newText;
      hasChanges = true;
    }
    
    if (hasChanges) {
      // Create a new element to replace the text node
      const wrapper = document.createElement('span');
      wrapper.innerHTML = formattedText;
      
      // Replace the text node with the new element
      node.parentNode.replaceChild(wrapper, node);
    }
  });
};

/**
 * Legacy function name for backward compatibility
 * @deprecated Use formatTextInDOM instead
 */
export const formatGreysAnatomyInDOM = formatTextInDOM;

/**
 * Hook to automatically format text after component renders
 * Applies both Grey's Anatomy italicization and quotation marks italicization
 */
export const useTextFormatting = () => {
  const formatText = () => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      formatTextInDOM();
    }, 0);
  };
  
  return formatText;
};

/**
 * Legacy hook name for backward compatibility
 * @deprecated Use useTextFormatting instead
 */
export const useGreysAnatomyFormatting = useTextFormatting;