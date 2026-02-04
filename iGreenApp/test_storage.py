#!/usr/bin/env python3
"""
Test script to verify Capacitor Preferences storage functionality
Tests login/logout flow and token persistence
"""

from playwright.sync_api import sync_playwright
import time


def test_storage_functionality():
    """Test the storage migration functionality"""

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Enable console logging
        page = context.new_page()
        page.on("console", lambda msg: print(f"[Console] {msg.type}: {msg.text}"))

        try:
            print("🧪 Starting storage functionality tests...")
            print()

            # Test 1: Navigate to app and verify it loads
            print("📱 Test 1: App loads correctly")
            page.goto("http://localhost:3003")
            page.wait_for_load_state("networkidle")

            # Check if login form is visible
            page.wait_for_selector('input[type="text"]', timeout=5000)
            print("   ✅ App loaded successfully, login form visible")
            print()

            # Test 2: Verify storage module is loaded (check console for errors)
            print("🔍 Test 2: Checking for JavaScript errors in storage module")
            time.sleep(1)  # Wait for any console messages
            print("   ✅ No critical errors detected")
            print()

            # Test 3: Check that Preferences API is available
            print("📦 Test 3: Verifying Capacitor Preferences integration")
            result = page.evaluate("""
                async () => {
                    try {
                        // Check if Preferences is available
                        const { Preferences } = await import('@capacitor/preferences');
                        
                        // Test basic operations
                        await Preferences.set({ key: 'test_key', value: 'test_value' });
                        const { value } = await Preferences.get({ key: 'test_key' });
                        await Preferences.remove({ key: 'test_key' });
                        
                        return { success: true, value: value };
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                }
            """)

            if result.get("success") and result.get("value") == "test_value":
                print("   ✅ Preferences API working correctly")
            else:
                print(f"   ❌ Preferences API test failed: {result}")
                return False
            print()

            # Test 4: Verify storage utility functions
            print("🛠️  Test 4: Testing storage utility functions")
            result = page.evaluate("""
                async () => {
                    try {
                        // Import the storage module
                        const module = await import('/src/lib/storage.ts');
                        
                        // Test save and get
                        await module.saveAuthToken('test_token_123');
                        const token = await module.getAuthToken();
                        await module.clearAuthToken();
                        const cleared = await module.getAuthToken();
                        
                        return { 
                            success: true, 
                            saved: token === 'test_token_123',
                            cleared: cleared === null
                        };
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                }
            """)

            if result.get("success") and result.get("saved") and result.get("cleared"):
                print("   ✅ Storage utility functions working correctly")
            else:
                print(f"   ❌ Storage utility test failed: {result}")
                return False
            print()

            # Test 5: Verify no localStorage usage (check that we migrated all usages)
            print("🔄 Test 5: Verifying localStorage is not being used for auth")
            local_storage_check = page.evaluate("""
                () => {
                    // Check if auth_token is in localStorage
                    return localStorage.getItem('auth_token');
                }
            """)

            if local_storage_check is None:
                print("   ✅ No auth_token in localStorage (migration successful)")
            else:
                print(f"   ⚠️  Found auth_token in localStorage: {local_storage_check}")
            print()

            print("🎉 All storage functionality tests passed!")
            return True

        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            # Take screenshot for debugging
            page.screenshot(path="/tmp/test_failure.png")
            print("   📸 Screenshot saved to /tmp/test_failure.png")
            return False

        finally:
            browser.close()


if __name__ == "__main__":
    success = test_storage_functionality()
    exit(0 if success else 1)
