#!/usr/bin/env python3
"""
Comprehensive CSS Class Analysis Tool

This script analyzes all CSS files in the src/styles/ directory and src/index.css,
extracts ALL CSS class definitions, and compares them against the used classes
list to identify unused CSS classes.

Handles edge cases including:
- Comments in CSS
- Media queries
- Complex selectors
- Pseudo-classes and pseudo-elements
- Attribute selectors
- Nested selectors
- Combined classes
- CSS custom properties/variables
- Keyframe animations
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict, Counter
from typing import Set, Dict, List, Tuple


class CSSAnalyzer:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.css_files = []
        self.all_css_classes = defaultdict(set)  # file -> set of classes
        self.used_classes = set()
        self.unused_classes = defaultdict(set)
        
        # Comprehensive regex patterns for different CSS class scenarios
        self.class_patterns = [
            # Standard class selectors: .classname
            r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?=[{,\s>+~:]|$)',
            
            # Classes in complex selectors (with descendants, children, etc.)
            r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?=[.#\[\s>+~:])',
            
            # Classes with pseudo-classes/elements: .class:hover, .class::before
            r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*:+[a-zA-Z-]+',
            
            # Classes with attribute selectors: .class[attr], .class[attr="value"]
            r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*\[',
            
            # Combined classes: .class1.class2
            r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)(?=\.)',
            
            # Classes in keyframe selectors and other special contexts
            r'\.([a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?=\s*{)',
        ]
        
        # Pattern to remove CSS comments
        self.comment_pattern = re.compile(r'/\*.*?\*/', re.DOTALL)
        
        # Patterns to ignore (not actual classes)
        self.ignore_patterns = [
            r'^[0-9]',  # Classes starting with numbers (invalid CSS)
            r'^-webkit-',  # Vendor prefixes
            r'^-moz-',
            r'^-ms-',
            r'^-o-',
        ]

    def find_css_files(self) -> List[Path]:
        """Find all CSS files in src/styles/ and src/index.css"""
        css_files = []
        
        # Add src/index.css
        index_css = self.base_path / 'src' / 'index.css'
        if index_css.exists():
            css_files.append(index_css)
        
        # Add all CSS files in src/styles/
        styles_dir = self.base_path / 'src' / 'styles'
        if styles_dir.exists():
            css_files.extend(styles_dir.rglob('*.css'))
        
        return sorted(css_files)

    def clean_css_content(self, content: str) -> str:
        """Remove comments and normalize whitespace"""
        # Remove CSS comments
        content = self.comment_pattern.sub('', content)
        
        # Normalize whitespace
        content = re.sub(r'\s+', ' ', content)
        
        return content.strip()

    def is_valid_class_name(self, class_name: str) -> bool:
        """Check if the class name is valid and should not be ignored"""
        if not class_name:
            return False
            
        # Check ignore patterns
        for pattern in self.ignore_patterns:
            if re.match(pattern, class_name):
                return False
        
        # Must be valid CSS identifier
        if not re.match(r'^[a-zA-Z_-][a-zA-Z0-9_-]*$', class_name):
            return False
            
        return True

    def extract_classes_from_css(self, content: str) -> Set[str]:
        """Extract all CSS class definitions from content"""
        classes = set()
        
        # Clean the content first
        content = self.clean_css_content(content)
        
        # Apply all regex patterns
        for pattern in self.class_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    # Handle cases where regex returns tuples
                    for m in match:
                        if self.is_valid_class_name(m):
                            classes.add(m)
                else:
                    if self.is_valid_class_name(match):
                        classes.add(match)
        
        # Additional pattern to catch classes in media queries and other contexts
        media_pattern = r'@media[^{]*{[^{}]*\.([a-zA-Z_-][a-zA-Z0-9_-]*)'
        media_matches = re.findall(media_pattern, content, re.DOTALL)
        for match in media_matches:
            if self.is_valid_class_name(match):
                classes.add(match)
        
        # Pattern for keyframe animations
        keyframe_pattern = r'@keyframes\s+([a-zA-Z_-][a-zA-Z0-9_-]*)'
        keyframe_matches = re.findall(keyframe_pattern, content, re.IGNORECASE)
        for match in keyframe_matches:
            if self.is_valid_class_name(match):
                classes.add(match)
        
        return classes

    def load_used_classes(self, used_classes_file: str) -> Set[str]:
        """Load the list of used classes from file"""
        used_classes = set()
        
        try:
            with open(used_classes_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract class names from the used classes file
            # Look for lines that start with - followed by class name
            class_lines = re.findall(r'^-\s*([a-zA-Z_-][a-zA-Z0-9_-]*)', content, re.MULTILINE)
            used_classes.update(class_lines)
            
            # Also look for class names in any format (more flexible parsing)
            all_words = re.findall(r'\b([a-zA-Z_-][a-zA-Z0-9_-]*)\b', content)
            for word in all_words:
                # Filter out common English words and keep likely CSS class names
                if (len(word) > 2 and 
                    ('-' in word or '_' in word or 
                     any(c.isupper() for c in word[1:]) or  # camelCase
                     word.lower() not in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'])):
                    used_classes.add(word)
            
        except FileNotFoundError:
            print(f"Warning: Used classes file '{used_classes_file}' not found")
        except Exception as e:
            print(f"Error reading used classes file: {e}")
        
        return used_classes

    def analyze_css_files(self) -> None:
        """Analyze all CSS files and extract class definitions"""
        self.css_files = self.find_css_files()
        
        for css_file in self.css_files:
            try:
                with open(css_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                classes = self.extract_classes_from_css(content)
                self.all_css_classes[str(css_file.relative_to(self.base_path))] = classes
                
            except Exception as e:
                print(f"Error processing {css_file}: {e}")

    def find_unused_classes(self) -> None:
        """Compare CSS classes against used classes to find unused ones"""
        for file_path, css_classes in self.all_css_classes.items():
            unused_in_file = css_classes - self.used_classes
            if unused_in_file:
                self.unused_classes[file_path] = unused_in_file

    def generate_report(self) -> str:
        """Generate comprehensive report of unused CSS classes"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("COMPREHENSIVE UNUSED CSS CLASSES ANALYSIS REPORT")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Summary statistics
        total_css_classes = sum(len(classes) for classes in self.all_css_classes.values())
        total_used_classes = len(self.used_classes)
        total_unused_classes = sum(len(classes) for classes in self.unused_classes.values())
        
        report_lines.append("SUMMARY STATISTICS")
        report_lines.append("-" * 40)
        report_lines.append(f"Total CSS files analyzed: {len(self.css_files)}")
        report_lines.append(f"Total CSS class definitions found: {total_css_classes}")
        report_lines.append(f"Total used classes in codebase: {total_used_classes}")
        report_lines.append(f"Total unused classes found: {total_unused_classes}")
        report_lines.append(f"Usage rate: {((total_css_classes - total_unused_classes) / max(total_css_classes, 1) * 100):.1f}%")
        report_lines.append("")
        
        # Files analyzed
        report_lines.append("CSS FILES ANALYZED")
        report_lines.append("-" * 40)
        for i, css_file in enumerate(self.css_files, 1):
            rel_path = css_file.relative_to(self.base_path)
            classes_count = len(self.all_css_classes.get(str(rel_path), set()))
            unused_count = len(self.unused_classes.get(str(rel_path), set()))
            report_lines.append(f"{i:2d}. {rel_path} ({classes_count} classes, {unused_count} unused)")
        report_lines.append("")
        
        # Unused classes by file
        if self.unused_classes:
            report_lines.append("UNUSED CSS CLASSES BY FILE")
            report_lines.append("-" * 40)
            
            for file_path, unused_classes in sorted(self.unused_classes.items()):
                report_lines.append(f"\n📁 {file_path}")
                report_lines.append(f"   {len(unused_classes)} unused classes:")
                
                # Sort classes alphabetically
                sorted_classes = sorted(unused_classes)
                for class_name in sorted_classes:
                    report_lines.append(f"   • .{class_name}")
        else:
            report_lines.append("🎉 NO UNUSED CSS CLASSES FOUND!")
            report_lines.append("All CSS classes are being used in the codebase.")
        
        report_lines.append("")
        
        # All CSS classes found (for reference)
        report_lines.append("ALL CSS CLASSES FOUND BY FILE")
        report_lines.append("-" * 40)
        
        for file_path, css_classes in sorted(self.all_css_classes.items()):
            report_lines.append(f"\n📁 {file_path}")
            report_lines.append(f"   {len(css_classes)} total classes:")
            
            sorted_classes = sorted(css_classes)
            for class_name in sorted_classes:
                status = "✓ USED" if class_name in self.used_classes else "✗ UNUSED"
                report_lines.append(f"   • .{class_name} ({status})")
        
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("ANALYSIS COMPLETE")
        report_lines.append("=" * 80)
        
        return "\n".join(report_lines)

    def run_analysis(self, used_classes_file: str) -> str:
        """Run the complete analysis"""
        print("🔍 Starting comprehensive CSS analysis...")
        
        # Load used classes
        print("📖 Loading used classes list...")
        self.used_classes = self.load_used_classes(used_classes_file)
        print(f"   Found {len(self.used_classes)} used classes")
        
        # Analyze CSS files
        print("🎨 Analyzing CSS files...")
        self.analyze_css_files()
        print(f"   Analyzed {len(self.css_files)} CSS files")
        
        # Find unused classes
        print("🔎 Identifying unused classes...")
        self.find_unused_classes()
        
        # Generate report
        print("📊 Generating report...")
        report = self.generate_report()
        
        print("✅ Analysis complete!")
        return report


def main():
    """Main function to run the CSS analysis"""
    base_path = "/mnt/c/Rare/GitHub/greys-anatomy-report"
    used_classes_file = os.path.join(base_path, "used-css-classes.txt")
    output_file = os.path.join(base_path, "unused-css-classes-report.txt")
    
    # Create analyzer and run analysis
    analyzer = CSSAnalyzer(base_path)
    report = analyzer.run_analysis(used_classes_file)
    
    # Save report to file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 Report saved to: {output_file}")
    except Exception as e:
        print(f"❌ Error saving report: {e}")
    
    # Also print summary to console
    print("\n" + "=" * 60)
    print("QUICK SUMMARY")
    print("=" * 60)
    
    total_css_classes = sum(len(classes) for classes in analyzer.all_css_classes.values())
    total_unused = sum(len(classes) for classes in analyzer.unused_classes.values())
    
    print(f"CSS files analyzed: {len(analyzer.css_files)}")
    print(f"Total CSS classes: {total_css_classes}")
    print(f"Used classes: {len(analyzer.used_classes)}")
    print(f"Unused classes: {total_unused}")
    print(f"Usage rate: {((total_css_classes - total_unused) / max(total_css_classes, 1) * 100):.1f}%")
    
    if analyzer.unused_classes:
        print(f"\nFiles with unused classes: {len(analyzer.unused_classes)}")
        for file_path, unused in sorted(analyzer.unused_classes.items()):
            print(f"  • {file_path}: {len(unused)} unused")


if __name__ == "__main__":
    main()