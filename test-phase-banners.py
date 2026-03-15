#!/usr/bin/env python3
"""Verify phase banners render correctly on the calendar."""
from playwright.sync_api import sync_playwright
import sys

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to the calendar
        page.goto('http://localhost:3001')
        page.wait_for_load_state('networkidle')
        
        # Take a screenshot for visual verification
        page.screenshot(path='/tmp/phase-banners.png', full_page=True)
        
        # Check for phase banners in the DOM
        # The PhaseBanner component should render with phase labels
        content = page.content()
        
        # Look for phase labels in the rendered HTML
        phase_labels = ['Base', 'Race Prep', 'Taper']
        found_labels = []
        
        for label in phase_labels:
            if label.lower() in content.lower():
                found_labels.append(label)
        
        print(f"Found phase labels: {found_labels}")
        
        # Check for CSS variables that indicate phase colors
        # The phase colors should be in the CSS as --phase-base, --phase-race-prep, --phase-taper
        has_phase_colors = '--phase-' in content
        print(f"Has phase CSS variables: {has_phase_colors}")
        
        # Check that the calendar grid exists
        calendar_exists = 'grid-cols-7' in content
        print(f"Calendar grid exists: {calendar_exists}")
        
        # Print summary
        print("\n=== Verification Results ===")
        if found_labels and has_phase_colors and calendar_exists:
            print("✓ Phase banners appear to be rendering correctly")
            print(f"  - Found labels: {', '.join(found_labels)}")
            print("  - Phase colors defined in CSS")
            print("  - Calendar grid present")
            browser.close()
            return 0
        else:
            print("✗ Potential issue detected")
            print(f"  - Labels found: {found_labels}")
            print(f"  - Phase colors: {has_phase_colors}")
            print(f"  - Grid: {calendar_exists}")
            browser.close()
            return 1

if __name__ == '__main__':
    sys.exit(main())
