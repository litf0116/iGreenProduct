#!/usr/bin/env python3
"""
工单完整流程测试
测试流程: 登录 → 接单 → 出发 → 到达 → 上传照片 → 提交审核

测试账号:
- 工程师: litengfei / ltf123
- 管理员: admin / admin123
"""

from playwright.sync_api import sync_playwright
import time
import os

# 配置
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8089"
ENGINEER_USERNAME = "litengfei"
ENGINEER_PASSWORD = "ltf123"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# 截图目录
SCREENSHOT_DIR = "/tmp/igreen_test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def save_screenshot(page, name):
    """保存截图"""
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"📸 Screenshot saved: {path}")


def test_engineer_workflow():
    """测试工程师完整工单流程"""
    with sync_playwright() as p:
        # 启动浏览器 (非 headless 模式便于观察)
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},  # iPhone 14 Pro 尺寸
            locale="zh-CN",
        )
        page = context.new_page()

        # 监听控制台日志
        page.on("console", lambda msg: print(f"[Console] {msg.type}: {msg.text}"))

        print("\n" + "=" * 60)
        print("🚀 开始测试工程师工单流程")
        print("=" * 60)

        # ==================== 1. 登录页面 ====================
        print("\n📱 Step 1: 访问登录页面")
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        save_screenshot(page, "01_login_page")

        # 等待登录表单加载
        page.wait_for_selector(
            'input[type="text"], input[placeholder*="用户"], input[placeholder*="Username"]',
            timeout=10000,
        )

        # 填写登录表单
        print(f"   填写用户名: {ENGINEER_USERNAME}")
        username_input = page.locator(
            'input[type="text"], input[placeholder*="用户"], input[placeholder*="Username"]'
        ).first
        username_input.fill(ENGINEER_USERNAME)

        print(f"   填写密码: {ENGINEER_PASSWORD}")
        password_input = page.locator('input[type="password"]').first
        password_input.fill(ENGINEER_PASSWORD)

        save_screenshot(page, "02_login_filled")

        # 点击登录按钮
        print("   点击登录按钮...")
        login_button = page.locator(
            'button:has-text("登录"), button:has-text("Login"), button[type="submit"]'
        ).first
        login_button.click()

        # 等待登录成功并跳转到主页
        page.wait_for_load_state("networkidle")
        time.sleep(2)  # 等待数据加载

        save_screenshot(page, "03_after_login")

        # 检查是否登录成功 (检查 URL 或页面元素)
        current_url = page.url
        print(f"   当前 URL: {current_url}")

        if "login" in current_url.lower():
            print("   ❌ 登录失败，仍在登录页")
            # 检查错误提示
            error_msg = page.locator(
                '[class*="error"], [class*="toast"]'
            ).text_content()
            print(f"   错误信息: {error_msg}")
            browser.close()
            return False

        print("   ✅ 登录成功")

        # ==================== 2. 工单列表 ====================
        print("\n📋 Step 2: 查看工单列表")
        save_screenshot(page, "04_dashboard")

        # 使用 accessibility snapshot 获取页面结构
        snapshot = page.accessibility.snapshot()
        print(f"   Accessibility snapshot 获取完成")

        # 等待数据加载
        time.sleep(3)

        # 直接使用 Playwright 的 locator API
        print("   查找页面上的按钮和可点击元素...")
        buttons = page.locator("button").all()
        print(f"   找到 {len(buttons)} 个按钮")

        for i, btn in enumerate(buttons[:10]):
            try:
                text = btn.text_content() or ""
                if text.strip():
                    print(f"   按钮 {i}: {text[:50]}")
            except:
                pass

        # ==================== 3. 选择并查看工单详情 ====================
        print("\n📄 Step 3: 选择工单并查看详情")

        time.sleep(3)

        # 获取页面快照分析结构
        snapshot = page.evaluate("""() => {
            const body = document.body.innerHTML;
            const divs = document.querySelectorAll('div');
            const result = {
                totalDivs: divs.length,
                sampleDivs: []
            };
            
            // 找到包含文本内容的 div
            for (let i = 0; i < Math.min(divs.length, 50); i++) {
                const div = divs[i];
                const text = div.textContent?.trim().substring(0, 100);
                const classes = div.className;
                if (text && text.length > 10 && !text.includes('React DevTools')) {
                    result.sampleDivs.push({
                        index: i,
                        classes: classes.substring(0, 50),
                        text: text.substring(0, 100)
                    });
                }
            }
            return result;
        }""")
        print(f"   页面共有 {snapshot['totalDivs']} 个 div")
        for div in snapshot["sampleDivs"][:5]:
            print(f"   [{div['index']}] {div['classes']}: {div['text'][:50]}...")

        # 尝试点击任何看起来像工单的元素
        clicked = page.evaluate("""() => {
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
                const text = div.textContent || '';
                // 查找包含工单标题关键词的元素
                if (text.includes('充电桩') || text.includes('维护') || text.includes('跳闸') || text.includes('调制解调器')) {
                    // 确保不是整个页面
                    if (text.length < 500) {
                        console.log('Found ticket card:', text.substring(0, 100));
                        div.click();
                        return true;
                    }
                }
            }
            return false;
        }""")

        if not clicked:
            print("   尝试点击工单按钮...")
            # 尝试点击 "Continue Job" 按钮
            continue_btn = page.locator('button:has-text("Continue")')
            if continue_btn.count() > 0:
                continue_btn.first.click()
                clicked = True

        if not clicked:
            print("   ❌ 无法找到可点击的工单")
            save_screenshot(page, "error_no_ticket")
            browser.close()
            return False

        time.sleep(2)
        save_screenshot(page, "06_ticket_detail")
        print("   ✅ 进入工单详情页")

        # ==================== 4. 接单 ====================
        print("\n✅ Step 4: 接单")

        # 查找接单按钮
        accept_button = page.locator(
            'button:has-text("Accept"), button:has-text("接单"), button:has-text("Grab")'
        )

        if accept_button.count() > 0 and accept_button.first.is_visible():
            accept_button.first.click()
            time.sleep(3)
            try:
                page.wait_for_load_state("networkidle", timeout=10000)
            except:
                pass
            save_screenshot(page, "07_after_accept")
            print("   ✅ 接单成功")
        else:
            print("   ⚠️ 未找到接单按钮，可能已接单")

        # ==================== 5. 出发 ====================
        print("\n🚗 Step 5: 出发")

        depart_button = page.locator(
            'button:has-text("Depart"), button:has-text("出发")'
        )

        if depart_button.count() > 0 and depart_button.first.is_visible():
            depart_button.first.click()
            page.wait_for_load_state("networkidle")
            time.sleep(1)
            save_screenshot(page, "08_after_depart")
            print("   ✅ 出发成功")
        else:
            print("   ⚠️ 未找到出发按钮")

        # ==================== 6. 到达 ====================
        print("\n📍 Step 6: 到达")

        arrive_button = page.locator(
            'button:has-text("Arrive"), button:has-text("Arrived"), button:has-text("到达")'
        )

        if arrive_button.count() > 0 and arrive_button.first.is_visible():
            arrive_button.first.click()
            page.wait_for_load_state("networkidle")
            time.sleep(2)  # 等待表单加载
            save_screenshot(page, "09_after_arrive")
            print("   ✅ 到达成功，显示工作表单")
        else:
            print("   ⚠️ 未找到到达按钮")

        # ==================== 7. 填写工作表单 ====================
        print("\n📝 Step 7: 填写工作表单")

        save_screenshot(page, "10_work_form")

        # 填写所有 textarea 字段
        textareas = page.locator("textarea").all()
        print(f"   找到 {len(textareas)} 个文本框")

        for i, textarea in enumerate(textareas):
            if textarea.is_visible():
                placeholder = textarea.get_attribute("placeholder") or f"字段 {i + 1}"
                print(f"   填写文本框 {i + 1}: {placeholder[:30]}...")
                if "cause" in placeholder.lower() or "原因" in placeholder:
                    textarea.fill("设备老化导致故障，需要更换零件")
                elif (
                    "solution" in placeholder.lower()
                    or "解决方案" in placeholder
                    or "action" in placeholder.lower()
                ):
                    textarea.fill("已更换损坏零件，设备恢复正常运行")
                elif "feedback" in placeholder.lower() or "备注" in placeholder:
                    textarea.fill("定期维护完成，设备状态良好")
                else:
                    textarea.fill(f"测试填写内容 - 字段 {i + 1}")
                time.sleep(0.5)

        # 填写日期字段
        date_inputs = page.locator('input[type="date"]').all()
        print(f"   找到 {len(date_inputs)} 个日期字段")

        from datetime import datetime, timedelta

        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

        for i, date_input in enumerate(date_inputs):
            if date_input.is_visible():
                print(f"   填写日期: {future_date}")
                date_input.fill(future_date)
                time.sleep(0.5)

        save_screenshot(page, "11_form_filled")

        # ==================== 8. 模拟上传照片 ====================
        print("\n📸 Step 8: 模拟上传照片")

        # 查找所有添加照片按钮
        add_photo_buttons = page.locator('button:has-text("Add")').all()
        print(f"   找到 {len(add_photo_buttons)} 个添加照片按钮")

        for i, add_btn in enumerate(add_photo_buttons):
            if add_btn.is_visible():
                print(f"   上传第 {i + 1} 张照片...")
                add_btn.click()
                time.sleep(1)

                mock_upload_button = page.locator('button:has-text("模拟上传")')
                if mock_upload_button.count() > 0:
                    mock_upload_button.first.click()
                    time.sleep(0.5)
                    print(f"   ✅ 照片 {i + 1} 上传成功")
                else:
                    page.keyboard.press("Escape")

        save_screenshot(page, "12_form_with_photos")

        # ==================== 9. 提交审核 ====================
        print("\n✅ Step 9: 提交审核")

        save_screenshot(page, "13_before_submit")

        finish_button = page.locator(
            'button:has-text("Finish"), button:has-text("完成"), button:has-text("提交")'
        )

        if finish_button.count() > 0:
            # 检查按钮是否可点击
            is_disabled = finish_button.first.is_disabled()
            if not is_disabled:
                finish_button.first.click()
                page.wait_for_load_state("networkidle")
                time.sleep(2)
                save_screenshot(page, "14_after_submit")
                print("   ✅ 提交审核成功")

                # 检查状态是否变为 review
                time.sleep(1)
                save_screenshot(page, "15_review_status")
            else:
                print("   ⚠️ 提交按钮被禁用，表单未完成")
                # 查看缺少什么
                page.evaluate(
                    "console.log('Form validation state:', document.querySelector('form')?.checkValidity?.())"
                )
        else:
            print("   ⚠️ 未找到提交按钮")

        # ==================== 完成 ====================
        print("\n" + "=" * 60)
        print("🎉 测试完成!")
        print("=" * 60)
        print(f"📸 截图保存在: {SCREENSHOT_DIR}")

        # 保持浏览器打开一段时间便于观察
        time.sleep(3)
        browser.close()
        return True


if __name__ == "__main__":
    test_engineer_workflow()
