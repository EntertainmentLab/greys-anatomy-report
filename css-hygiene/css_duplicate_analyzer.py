#!/usr/bin/env python3
"""
CSS Duplicate Class Analyzer

Comprehensive Python script to find all CSS classes that have duplicate definitions 
across the codebase. Scans all CSS files, identifies duplicates, and generates a 
detailed report.

Features:
- Scans all CSS files in src/styles/ directory
- Extracts CSS class definitions using regex patterns
- Handles nested classes, media queries, pseudo-selectors
- Tracks file locations and line numbers
- Identifies identical vs different duplicate definitions
- Generates comprehensive report with statistics
"""

import os
import re
import hashlib
from collections import defaultdict, namedtuple
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional

# Data structures
ClassDefinition = namedtuple('ClassDefinition', ['file_path', 'line_number', 'content', 'content_hash', 'selector'])

class CSSClassAnalyzer:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.css_files = []
        self.class_definitions = defaultdict(list)
        self.total_classes = 0
        self.duplicate_classes = {}
        
        # Comprehensive regex patterns for CSS class extraction
        self.class_patterns = [
            # Standard class selectors: .classname
            r'\.([a-zA-Z_][\w-]*)\s*(?:[,\s{]|$)',
            
            # Classes with pseudo-selectors: .classname:hover, .classname::before
            r'\.([a-zA-Z_][\w-]*):+[\w-]+\s*(?:[,\s{]|$)',
            
            # Classes in complex selectors: .parent .child, .class1.class2
            r'\.([a-zA-Z_][\w-]*)\s*(?=[\s\.,#:\[])',
            
            # Classes at the beginning of rules
            r'^\s*\.([a-zA-Z_][\w-]*)',
            
            # Classes after combinators: > .class, + .class, ~ .class
            r'[>+~]\s*\.([a-zA-Z_][\w-]*)',
        ]
        
        # Compile regex patterns for efficiency
        self.compiled_patterns = [re.compile(pattern, re.MULTILINE) for pattern in self.class_patterns]
        
        # Pattern to extract CSS rule content (class definition to closing brace)
        self.rule_content_pattern = re.compile(
            r'(\.[\w\s\-:.,#>+~\[\]="\'()]+)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}',
            re.MULTILINE | re.DOTALL
        )
    
    def find_css_files(self) -> List[Path]:
        """Find all CSS files in the src/styles directory."""
        css_files = []
        styles_path = self.base_path / 'src' / 'styles'
        
        if not styles_path.exists():
            print(f"Warning: Styles directory not found at {styles_path}")
            return css_files
        
        # Also check for CSS files in src root
        src_path = self.base_path / 'src'
        for css_file in src_path.rglob('*.css'):
            # Skip node_modules and other unwanted directories
            if 'node_modules' not in str(css_file) and 'dist' not in str(css_file):
                css_files.append(css_file)
        
        return sorted(css_files)
    
    def extract_css_content(self, file_path: Path, start_line: int, selector: str) -> str:
        """Extract the CSS content for a specific selector."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the rule that contains this selector
            for match in self.rule_content_pattern.finditer(content):
                if selector in match.group(1):
                    # Return first 200 characters of the rule content
                    rule_content = match.group(2).strip()
                    return rule_content[:200] + ('...' if len(rule_content) > 200 else '')
            
            return "Content not found"
            
        except Exception as e:
            return f"Error reading content: {str(e)}"
    
    def parse_css_file(self, file_path: Path) -> None:
        """Parse a CSS file and extract class definitions."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return
        
        # Track found classes to avoid duplicates from multiple patterns
        found_classes = set()
        
        # Use the comprehensive rule pattern to find complete CSS rules
        for match in self.rule_content_pattern.finditer(content):
            selector_part = match.group(1)
            rule_content = match.group(2)
            
            # Extract class names from the selector
            classes_in_selector = set()
            for pattern in self.compiled_patterns:
                for class_match in pattern.finditer(selector_part):
                    class_name = class_match.group(1)
                    if class_name and class_name not in found_classes:
                        classes_in_selector.add(class_name)
            
            # For each class found in this rule
            for class_name in classes_in_selector:
                if class_name not in found_classes:
                    found_classes.add(class_name)
                    
                    # Find line number
                    line_number = content[:match.start()].count('\n') + 1
                    
                    # Create content hash for duplicate detection
                    content_hash = hashlib.md5(rule_content.encode()).hexdigest()
                    
                    # Store class definition
                    class_def = ClassDefinition(
                        file_path=str(file_path.relative_to(self.base_path)),
                        line_number=line_number,
                        content=rule_content.strip()[:200] + ('...' if len(rule_content.strip()) > 200 else ''),
                        content_hash=content_hash,
                        selector=selector_part.strip()
                    )
                    
                    self.class_definitions[class_name].append(class_def)
                    self.total_classes += 1
    
    def analyze_duplicates(self) -> None:
        """Analyze class definitions to find duplicates."""
        for class_name, definitions in self.class_definitions.items():
            if len(definitions) > 1:
                # Check if definitions are identical or different
                unique_hashes = set(defn.content_hash for defn in definitions)
                
                duplicate_info = {
                    'definitions': definitions,
                    'total_occurrences': len(definitions),
                    'unique_definitions': len(unique_hashes),
                    'is_identical': len(unique_hashes) == 1,
                    'files_involved': list(set(defn.file_path for defn in definitions))
                }
                
                self.duplicate_classes[class_name] = duplicate_info
    
    def generate_report(self) -> str:
        """Generate a comprehensive duplicate CSS classes report."""
        report_lines = []
        
        # Header
        report_lines.extend([
            "=" * 80,
            "CSS DUPLICATE CLASS ANALYSIS REPORT",
            "=" * 80,
            "",
            f"Analysis completed on: {self.base_path}",
            f"Files analyzed: {len(self.css_files)}",
            f"Total CSS classes found: {self.total_classes}",
            f"Unique class names: {len(self.class_definitions)}",
            f"Classes with duplicates: {len(self.duplicate_classes)}",
            "",
        ])
        
        # Summary statistics
        if self.duplicate_classes:
            identical_duplicates = sum(1 for info in self.duplicate_classes.values() if info['is_identical'])
            different_duplicates = len(self.duplicate_classes) - identical_duplicates
            
            report_lines.extend([
                "SUMMARY STATISTICS:",
                "-" * 40,
                f"Classes with identical duplicates: {identical_duplicates}",
                f"Classes with different duplicates: {different_duplicates}",
                f"Total duplicate occurrences: {sum(info['total_occurrences'] for info in self.duplicate_classes.values())}",
                "",
            ])
        
        # Files analyzed
        report_lines.extend([
            "FILES ANALYZED:",
            "-" * 40,
        ])
        for css_file in self.css_files:
            relative_path = css_file.relative_to(self.base_path)
            report_lines.append(f"  - {relative_path}")
        report_lines.append("")
        
        # Detailed duplicate analysis
        if self.duplicate_classes:
            report_lines.extend([
                "DETAILED DUPLICATE ANALYSIS:",
                "=" * 50,
                "",
            ])
            
            # Sort by number of occurrences (most duplicated first)
            sorted_duplicates = sorted(
                self.duplicate_classes.items(), 
                key=lambda x: x[1]['total_occurrences'], 
                reverse=True
            )
            
            for class_name, info in sorted_duplicates:
                report_lines.extend([
                    f"CLASS: .{class_name}",
                    "-" * (len(class_name) + 8),
                    f"Total occurrences: {info['total_occurrences']}",
                    f"Unique definitions: {info['unique_definitions']}",
                    f"Status: {'IDENTICAL' if info['is_identical'] else 'DIFFERENT'} duplicates",
                    f"Files involved: {', '.join(info['files_involved'])}",
                    "",
                ])
                
                # Show each definition
                for i, defn in enumerate(info['definitions'], 1):
                    report_lines.extend([
                        f"  Definition #{i}:",
                        f"    File: {defn.file_path}",
                        f"    Line: {defn.line_number}",
                        f"    Selector: {defn.selector}",
                        f"    Content preview:",
                    ])
                    
                    # Format CSS content preview
                    content_lines = defn.content.split('\n')
                    for line in content_lines[:5]:  # Show first 5 lines
                        if line.strip():
                            report_lines.append(f"      {line.strip()}")
                    
                    if len(content_lines) > 5:
                        report_lines.append("      ...")
                    
                    report_lines.append("")
                
                report_lines.append("-" * 60)
                report_lines.append("")
        
        else:
            report_lines.extend([
                "NO DUPLICATE CLASSES FOUND!",
                "",
                "This is excellent - your CSS codebase has no duplicate class definitions.",
                "All class names are unique across your stylesheets.",
                "",
            ])
        
        # Recommendations
        if self.duplicate_classes:
            report_lines.extend([
                "",
                "RECOMMENDATIONS:",
                "=" * 30,
                "",
            ])
            
            identical_count = sum(1 for info in self.duplicate_classes.values() if info['is_identical'])
            different_count = len(self.duplicate_classes) - identical_count
            
            if identical_count > 0:
                report_lines.extend([
                    f"1. CONSOLIDATION OPPORTUNITIES ({identical_count} classes):",
                    "   - These classes have identical definitions across multiple files",
                    "   - Consider moving them to a shared/common CSS file",
                    "   - Remove duplicates to reduce bundle size and improve maintainability",
                    "",
                ])
            
            if different_count > 0:
                report_lines.extend([
                    f"2. POTENTIAL CONFLICTS ({different_count} classes):",
                    "   - These classes have different definitions with the same name",
                    "   - Review for unintended style conflicts",
                    "   - Consider renaming classes to be more specific",
                    "   - Check CSS specificity and cascade order",
                    "",
                ])
            
            report_lines.extend([
                "3. GENERAL RECOMMENDATIONS:",
                "   - Use consistent naming conventions (BEM methodology recommended)",
                "   - Organize CSS into logical modules/components",
                "   - Consider CSS-in-JS or CSS modules for component isolation",
                "   - Implement CSS linting rules to prevent future duplicates",
                "",
            ])
        
        # Footer
        report_lines.extend([
            "=" * 80,
            "End of CSS Duplicate Analysis Report",
            "=" * 80,
        ])
        
        return '\n'.join(report_lines)
    
    def run_analysis(self) -> str:
        """Run the complete CSS duplicate analysis."""
        print("Starting CSS duplicate class analysis...")
        
        # Find CSS files
        self.css_files = self.find_css_files()
        print(f"Found {len(self.css_files)} CSS files")
        
        if not self.css_files:
            return "No CSS files found to analyze."
        
        # Parse each CSS file
        for css_file in self.css_files:
            print(f"Parsing: {css_file.relative_to(self.base_path)}")
            self.parse_css_file(css_file)
        
        print(f"Extracted {self.total_classes} total class definitions")
        print(f"Found {len(self.class_definitions)} unique class names")
        
        # Analyze for duplicates
        self.analyze_duplicates()
        print(f"Identified {len(self.duplicate_classes)} classes with duplicates")
        
        # Generate report
        report = self.generate_report()
        
        return report

def main():
    """Main function to run the CSS duplicate analysis."""
    # Get the current working directory as base path
    base_path = os.getcwd()
    
    print(f"CSS Duplicate Class Analyzer")
    print(f"Analyzing codebase at: {base_path}")
    print("-" * 60)
    
    # Create analyzer and run analysis
    analyzer = CSSClassAnalyzer(base_path)
    report = analyzer.run_analysis()
    
    # Save report to file
    output_file = Path(base_path) / 'css-hygiene' / 'duplicate-css-classes-report.txt'
    output_file.parent.mkdir(exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport saved to: {output_file}")
    print("\nSummary:")
    print(f"- Files analyzed: {len(analyzer.css_files)}")
    print(f"- Total classes: {analyzer.total_classes}")
    print(f"- Unique classes: {len(analyzer.class_definitions)}")
    print(f"- Duplicate classes: {len(analyzer.duplicate_classes)}")
    
    if analyzer.duplicate_classes:
        identical = sum(1 for info in analyzer.duplicate_classes.values() if info['is_identical'])
        different = len(analyzer.duplicate_classes) - identical
        print(f"  - Identical duplicates: {identical}")
        print(f"  - Different duplicates: {different}")

if __name__ == "__main__":
    main()