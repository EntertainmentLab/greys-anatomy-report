#!/usr/bin/env python3

import re
import os
from pathlib import Path

def extract_css_classes(file_path):
    """Extract all CSS class definitions from a file"""
    classes = set()
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Match class selectors (excluding pseudo-classes and pseudo-elements)
        pattern = r'^\s*\.([a-zA-Z0-9_-]+)(?:\s|{|,|:(?!:))'
        
        for line in content.split('\n'):
            matches = re.findall(pattern, line, re.MULTILINE)
            for match in matches:
                classes.add(match)
                
    return classes

def extract_used_classes(file_path):
    """Extract used classes from the used-css-classes.txt file"""
    used_classes = set()
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Extract classes from lines starting with "- "
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('- '):
                class_name = line[2:].strip()
                if class_name and not class_name.startswith('`'):
                    used_classes.add(class_name)
                    
    return used_classes

def remove_unused_classes(css_file, unused_classes):
    """Remove unused class definitions from a CSS file"""
    
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    # Keep track of which lines to keep
    new_lines = []
    inside_unused_block = False
    current_block = []
    brace_count = 0
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this line starts an unused class definition
        class_match = re.match(r'^\s*\.([a-zA-Z0-9_-]+)(?:\s|{|,|:|$)', line)
        
        if class_match and not inside_unused_block:
            class_name = class_match.group(1)
            if class_name in unused_classes:
                # Check if this is a complete rule on one line
                if '{' in line and '}' in line:
                    # Single line rule - skip it
                    i += 1
                    continue
                elif '{' in line:
                    # Start of a multi-line rule
                    inside_unused_block = True
                    brace_count = line.count('{') - line.count('}')
                    current_block = [line]
                else:
                    # Class selector without opening brace yet
                    # Look ahead to see if next line has the opening brace
                    if i + 1 < len(lines) and '{' in lines[i + 1]:
                        inside_unused_block = True
                        current_block = [line]
                    else:
                        new_lines.append(line)
            else:
                new_lines.append(line)
        elif inside_unused_block:
            current_block.append(line)
            brace_count += line.count('{') - line.count('}')
            if brace_count <= 0:
                # End of the unused block
                inside_unused_block = False
                current_block = []
                brace_count = 0
        else:
            new_lines.append(line)
        
        i += 1
    
    # Remove extra empty lines (more than 2 consecutive)
    final_lines = []
    empty_count = 0
    
    for line in new_lines:
        if line.strip() == '':
            empty_count += 1
            if empty_count <= 2:
                final_lines.append(line)
        else:
            empty_count = 0
            final_lines.append(line)
    
    # Write back the cleaned content
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(final_lines))

def main():
    # Define paths
    styles_dir = "/mnt/c/Rare/GitHub/greys-anatomy-report/src/styles"
    used_classes_file = "/mnt/c/Rare/GitHub/greys-anatomy-report/used-css-classes.txt"
    
    # Extract used classes
    used_classes = extract_used_classes(used_classes_file)
    print(f"Found {len(used_classes)} used CSS classes")
    
    # Find all CSS files
    css_files = []
    for root, dirs, files in os.walk(styles_dir):
        for file in files:
            if file.endswith('.css'):
                css_files.append(os.path.join(root, file))
    
    print(f"Found {len(css_files)} CSS files")
    
    # Process each CSS file
    total_removed = 0
    
    for css_file in sorted(css_files):
        # Skip certain files that might be imports or have special rules
        if css_file.endswith(('variables.css', 'reset.css', 'fonts.css', 'main.css', 'design-tokens.css')):
            continue
            
        # Extract classes from this file
        defined_classes = extract_css_classes(css_file)
        unused_classes = defined_classes - used_classes
        
        if unused_classes:
            relative_path = css_file.replace("/mnt/c/Rare/GitHub/greys-anatomy-report/", "")
            print(f"\nProcessing {relative_path} - removing {len(unused_classes)} unused classes")
            
            # Remove unused classes
            remove_unused_classes(css_file, unused_classes)
            total_removed += len(unused_classes)
            
    print(f"\n{'='*80}")
    print(f"COMPLETED: Removed {total_removed} unused CSS class definitions")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()