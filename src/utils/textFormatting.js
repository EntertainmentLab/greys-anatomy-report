/**
 * Utility function to automatically italicize "Grey's Anatomy" text in the DOM
 * This function searches for text nodes and replaces "Grey's Anatomy" with italicized version
 */
export const formatGreysAnatomyInDOM = () => {
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
    const regex = /Grey's Anatomy|Greys Anatomy/gi;
    
    if (regex.test(text)) {
      // Create a new element to replace the text node
      const wrapper = document.createElement('span');
      wrapper.innerHTML = text.replace(regex, '<em>Grey\'s Anatomy</em>');
      
      // Replace the text node with the new element
      node.parentNode.replaceChild(wrapper, node);
    }
  });
};

/**
 * Hook to automatically format Grey's Anatomy text after component renders
 */
export const useGreysAnatomyFormatting = () => {
  const formatText = () => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      formatGreysAnatomyInDOM();
    }, 0);
  };
  
  return formatText;
};