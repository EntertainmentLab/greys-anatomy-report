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
        # This regex captures: .class-name but not :hover, ::before, etc.
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
                # Handle conditional classes (e.g., "checkbox-label--control")
                if class_name and not class_name.startswith('`'):
                    used_classes.add(class_name)
                    
    return used_classes

def find_css_files(directory):
    """Find all CSS files in the given directory"""
    css_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.css'):
                css_files.append(os.path.join(root, file))
    return css_files

def main():
    # Define paths
    styles_dir = "/mnt/c/Rare/GitHub/greys-anatomy-report/src/styles"
    used_classes_file = "/mnt/c/Rare/GitHub/greys-anatomy-report/used-css-classes.txt"
    
    # Extract used classes
    used_classes = extract_used_classes(used_classes_file)
    print(f"Found {len(used_classes)} used CSS classes")
    
    # Find all CSS files
    css_files = find_css_files(styles_dir)
    print(f"Found {len(css_files)} CSS files")
    
    # Extract all defined classes
    all_defined_classes = {}
    for css_file in css_files:
        classes = extract_css_classes(css_file)
        if classes:
            all_defined_classes[css_file] = classes
            
    # Find unused classes
    unused_classes_by_file = {}
    total_defined = 0
    
    for css_file, defined_classes in all_defined_classes.items():
        total_defined += len(defined_classes)
        unused = defined_classes - used_classes
        if unused:
            unused_classes_by_file[css_file] = sorted(unused)
            
    print(f"\nTotal defined classes: {total_defined}")
    print(f"Total unused classes: {sum(len(classes) for classes in unused_classes_by_file.values())}")
    
    # Print unused classes by file
    print("\n" + "="*80)
    print("UNUSED CSS CLASSES BY FILE:")
    print("="*80)
    
    for css_file, unused_classes in sorted(unused_classes_by_file.items()):
        relative_path = css_file.replace("/mnt/c/Rare/GitHub/greys-anatomy-report/", "")
        print(f"\n{relative_path} ({len(unused_classes)} unused classes):")
        for class_name in unused_classes:
            print(f"  - .{class_name}")
            
    # Create a summary file
    with open("/mnt/c/Rare/GitHub/greys-anatomy-report/unused-css-summary.txt", "w") as f:
        f.write("UNUSED CSS CLASSES SUMMARY\n")
        f.write("="*80 + "\n\n")
        f.write(f"Total CSS files analyzed: {len(css_files)}\n")
        f.write(f"Total defined classes: {total_defined}\n")
        f.write(f"Total used classes: {len(used_classes)}\n")
        f.write(f"Total unused classes: {sum(len(classes) for classes in unused_classes_by_file.values())}\n")
        f.write("\n" + "="*80 + "\n")
        f.write("UNUSED CLASSES BY FILE:\n")
        f.write("="*80 + "\n")
        
        for css_file, unused_classes in sorted(unused_classes_by_file.items()):
            relative_path = css_file.replace("/mnt/c/Rare/GitHub/greys-anatomy-report/", "")
            f.write(f"\n{relative_path} ({len(unused_classes)} unused classes):\n")
            for class_name in unused_classes:
                f.write(f"  - .{class_name}\n")

if __name__ == "__main__":
    main()