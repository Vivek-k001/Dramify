#!/usr/bin/env python3
import time
from playwright.sync_api import sync_playwright

CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
BASE_URL = 'https://dramify-olive.vercel.app'

PAGES = [
    {
        'url': f'{BASE_URL}/',
        'output': 'docs/screenshots/home.png',
        'scroll': 0,
    },
    {
        'url': f'{BASE_URL}/profile',
        'output': 'docs/screenshots/profile.png',
        'scroll': 0,
    },
    {
        'url': f'{BASE_URL}/discover',
        'output': 'docs/screenshots/discover.png',
        'scroll': 0,
    },
]

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=1.5, # High DPI for ultra crisp retina screenshots
        )

        for item in PAGES:
            print(f"Navigating to {item['url']}...")
            page = context.new_page()
            page.goto(item['url'], wait_until='networkidle', timeout=30000)
            time.sleep(2) # Allow image posters and fonts to stabilize

            if item.get('scroll', 0) > 0:
                page.evaluate(f"window.scrollBy(0, {item['scroll']})")
                time.sleep(0.5)

            page.screenshot(path=item['output'])
            print(f"  --> Saved {item['output']}")
            page.close()

        browser.close()
    print("All screenshots successfully captured!")

if __name__ == '__main__':
    capture_all()
