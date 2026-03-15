#!/usr/bin/env python3
"""Verify phase banners render correctly on the calendar.

Usage:
    python scripts/verify-phase-banners.py [port]

Requires a running dev server (npm run dev). Default port: 3000.
"""
import sys
from playwright.sync_api import sync_playwright

PORT = sys.argv[1] if len(sys.argv) > 1 else '3000'
BASE_URL = f'http://localhost:{PORT}'


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(BASE_URL)
        page.wait_for_load_state('networkidle')

        page.screenshot(path='/tmp/phase-banners.png', full_page=True)

        errors = []

        # 1. Phase labels rendered as visible DOM text
        for label in ['Base', 'Race Prep', 'Taper']:
            locator = page.locator(f'text="{label}"')
            count = locator.count()
            if count == 0:
                errors.append(f'Phase label "{label}" not found in rendered DOM')
            else:
                print(f'  ✓ Phase label "{label}" found ({count} instance(s))')

        # 2. PhaseBanner divs exist (absolute inset-0 pointer-events-none inside week rows)
        banner_divs = page.locator('[style*="border-left"]').count()
        if banner_divs == 0:
            errors.append('No elements with border-left style found — phase banners may not be rendering')
        else:
            print(f'  ✓ Found {banner_divs} element(s) with border-left style (phase banners)')

        # 3. Calendar week rows exist (each week is a positioned relative grid row)
        week_rows = page.locator('.grid.grid-cols-7, [class*="grid-cols-7"]').count()
        if week_rows == 0:
            errors.append('No grid-cols-7 week rows found — calendar grid may be broken')
        else:
            print(f'  ✓ Found {week_rows} grid row(s)')

        browser.close()

        print('\n=== Verification Results ===')
        if errors:
            print('✗ Issues found:')
            for e in errors:
                print(f'  - {e}')
            print(f'\nScreenshot saved to /tmp/phase-banners.png')
            return 1

        print('✓ Phase banners verified successfully')
        print(f'  Screenshot saved to /tmp/phase-banners.png')
        return 0


if __name__ == '__main__':
    sys.exit(main())
