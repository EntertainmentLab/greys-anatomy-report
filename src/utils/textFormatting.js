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
    // Process each quoted section individually to handle multiple quotes correctly
    if (formattedText.includes('"')) {
      // Split on quotes and process alternating sections
      const parts = formattedText.split('"');
      let newText = '';
      let insideQuotes = false;
      
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          newText += '"'; // Add back the quote
        }
        
        if (insideQuotes && parts[i].trim() !== '') {
          // This part is inside quotes, italicize it
          newText += '<em>' + parts[i] + '</em>';
        } else {
          // This part is outside quotes, keep as is
          newText += parts[i];
        }
        
        // Toggle the inside quotes state for next iteration
        if (i < parts.length - 1) {
          insideQuotes = !insideQuotes;
        }
      }
      
      if (newText !== formattedText) {
        formattedText = newText;
        hasChanges = true;
      }
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