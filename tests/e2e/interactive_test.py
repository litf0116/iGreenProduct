#!/usr/bin/env python3
"""
交互式工单流程测试
保持浏览器打开，逐步执行测试步骤
"""

from playwright.sync_api import sync_playwright
import time
import os

FRONTEND_URL = "http://localhost:3000"
ENGINEER_USERNAME = "litengfei"
ENGINEER_PASSWORD = "ltf123"
SCREENSHOT_DIR = "/tmp/igreen_test_screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def save_screenshot(page, name):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"📸 截图保存: {path}")


class InteractiveTest:
    def __init__(self):
        self.browser = None
        self.page = None
        self.playwright = None

    def start(self):
        """启动浏览器"""
        print("\n🚀 启动浏览器...")
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=False, slow_mo=300)
        self.context = self.browser.new_context(
            viewport={"width": 390, "height": 844}, locale="zh-CN"
        )
        self.page = self.context.new_page()
        self.page.on(
            "console",
            lambda msg: print(f"[Console] {msg.type}: {msg.text}")
            if msg.type in ["error", "warning"]
            else None,
        )
        print("✅ 浏览器已启动")
        return self.page

    def navigate(self, url):
        """导航到指定 URL"""
        print(f"\n🌐 导航到: {url}")
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

    def login(self, username=None, password=None):
        """登录"""
        username = username or ENGINEER_USERNAME
        password = password or ENGINEER_PASSWORD

        print(f"\n🔐 登录: {username}")

        # 填写用户名
        username_input = self.page.locator('input[type="text"]').first
        username_input.fill(username)

        # 填写密码
        password_input = self.page.locator('input[type="password"]').first
        password_input.fill(password)

        save_screenshot(self.page, "login_filled")

        # 点击登录
        login_button = self.page.locator('button[type="submit"]').first
        login_button.click()

        time.sleep(2)
        self.page.wait_for_load_state("networkidle")
        save_screenshot(self.page, "after_login")

        print(f"✅ 登录完成，当前 URL: {self.page.url}")

    def click_ticket(self, index=0):
        """点击工单"""
        print(f"\n📋 点击第 {index + 1} 个工单...")

        # 获取所有工单卡片
        cards = self.page.evaluate("""() => {
            const results = [];
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
                const text = div.textContent || '';
                if ((text.includes('P1') || text.includes('P2') || text.includes('P3')) && text.length < 300) {
                    results.push(text.substring(0, 100));
                }
            }
            return results;
        }""")

        print(f"找到 {len(cards)} 个可能的工单卡片:")
        for i, card in enumerate(cards[:5]):
            print(f"  [{i}] {card[:60]}...")

        # 点击指定索引
        self.page.evaluate(f"""() => {{
            const allDivs = document.querySelectorAll('div');
            let count = 0;
            for (const div of allDivs) {{
                const text = div.textContent || '';
                if ((text.includes('P1') || text.includes('P2') || text.includes('P3')) && text.length < 300) {{
                    if (count === {index}) {{
                        div.click();
                        return true;
                    }}
                    count++;
                }}
            }}
            return false;
        }}""")

        time.sleep(2)
        save_screenshot(self.page, "ticket_detail")
        print("✅ 已进入工单详情")

    def accept_ticket(self):
        """接单"""
        print("\n✅ 接单...")
        accept_btn = self.page.locator(
            'button:has-text("Accept"), button:has-text("Grab")'
        )
        if accept_btn.count() > 0:
            accept_btn.first.click()
            time.sleep(2)
            save_screenshot(self.page, "after_accept")
            print("✅ 接单成功")
        else:
            print("⚠️ 未找到接单按钮")

    def depart(self):
        """出发"""
        print("\n🚗 出发...")
        depart_btn = self.page.locator(
            'button:has-text("Depart"), button:has-text("出发")'
        )
        if depart_btn.count() > 0:
            depart_btn.first.click()
            time.sleep(2)
            save_screenshot(self.page, "after_depart")
            print("✅ 出发成功")
        else:
            print("⚠️ 未找到出发按钮")

    def arrive(self):
        """到达"""
        print("\n📍 到达...")
        arrive_btn = self.page.locator(
            'button:has-text("Arrive"), button:has-text("Arrived")'
        )
        if arrive_btn.count() > 0:
            arrive_btn.first.click()
            time.sleep(3)
            save_screenshot(self.page, "after_arrive")
            print("✅ 到达成功，表单已加载")
        else:
            print("⚠️ 未找到到达按钮")

    def fill_form(self):
        """填写表单"""
        print("\n📝 填写表单...")

        # 填写所有文本框
        textareas = self.page.locator("textarea").all()
        print(f"找到 {len(textareas)} 个文本框")
        for i, textarea in enumerate(textareas):
            if textarea.is_visible():
                placeholder = textarea.get_attribute("placeholder") or f"字段{i + 1}"
                value = f"测试内容 - {placeholder[:20]}"
                textarea.fill(value)
                print(f"  填写: {placeholder[:30]} -> {value[:30]}")

        # 填写日期
        from datetime import datetime, timedelta

        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        date_inputs = self.page.locator('input[type="date"]').all()
        print(f"找到 {len(date_inputs)} 个日期字段")
        for date_input in date_inputs:
            if date_input.is_visible():
                date_input.fill(future_date)
                print(f"  填写日期: {future_date}")

        save_screenshot(self.page, "form_filled")
        print("✅ 表单填写完成")

    def upload_photos(self, count=1):
        """上传照片"""
        print(f"\n📸 上传 {count} 张照片...")

        for i in range(count):
            add_btns = self.page.locator('button:has-text("Add")').all()
            if i < len(add_btns):
                add_btns[i].click()
                time.sleep(1)

                mock_btn = self.page.locator('button:has-text("模拟上传")')
                if mock_btn.count() > 0:
                    mock_btn.first.click()
                    time.sleep(0.5)
                    print(f"  ✅ 照片 {i + 1} 上传成功")
                else:
                    self.page.keyboard.press("Escape")
                    print(f"  ⚠️ 照片 {i + 1} 未找到模拟上传按钮")

        save_screenshot(self.page, "photos_uploaded")
        print("✅ 照片上传完成")

    def submit(self):
        """提交审核"""
        print("\n📤 提交审核...")

        finish_btn = self.page.locator(
            'button:has-text("Finish"), button:has-text("完成")'
        )
        if finish_btn.count() > 0:
            btn = finish_btn.first
            is_disabled = btn.is_disabled()

            if is_disabled:
                print("⚠️ 提交按钮被禁用，表单验证未通过")
                print("   请检查必填字段是否都已填写")
            else:
                btn.click()
                time.sleep(2)
                save_screenshot(self.page, "after_submit")
                print("✅ 提交成功")

                # 检查状态
                time.sleep(1)
                save_screenshot(self.page, "review_status")
                print("✅ 工单状态已更新")
        else:
            print("⚠️ 未找到提交按钮")

    def screenshot(self, name=None):
        """截图"""
        name = name or f"screenshot_{int(time.time())}"
        save_screenshot(self.page, name)

    def close(self):
        """关闭浏览器"""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        print("\n👋 浏览器已关闭")


# 全局测试实例
test = InteractiveTest()
page = None


def cmd_help():
    print("""
可用命令:
  start       - 启动浏览器
  goto <url>  - 导航到指定 URL
  login       - 登录 (默认 litengfei)
  ticket <n>  - 点击第 n 个工单 (默认 0)
  accept      - 接单
  depart      - 出发
  arrive      - 到达
  fill        - 填写表单
  photos <n>  - 上传 n 张照片 (默认 1)
  submit      - 提交审核
  shot [name] - 截图
  quit        - 退出
  help        - 显示帮助
""")


def main():
    global page, test

    print("=" * 60)
    print("🎯 交互式工单流程测试")
    print("=" * 60)
    print("输入 'help' 查看可用命令\n")

    while True:
        try:
            user_input = input("\n> ").strip()
            if not user_input:
                continue

            parts = user_input.split()
            cmd = parts[0].lower()
            args = parts[1:]

            if cmd == "quit" or cmd == "exit":
                test.close()
                break

            elif cmd == "help":
                cmd_help()

            elif cmd == "start":
                page = test.start()

            elif cmd == "goto":
                if not page:
                    print("❌ 请先运行 'start' 启动浏览器")
                    continue
                url = args[0] if args else FRONTEND_URL
                test.navigate(url)

            elif cmd == "login":
                if not page:
                    print("❌ 请先运行 'start' 启动浏览器")
                    continue
                username = args[0] if args else None
                password = args[1] if len(args) > 1 else None
                test.login(username, password)

            elif cmd == "ticket":
                if not page:
                    print("❌ 请先运行 'start' 启动浏览器")
                    continue
                index = int(args[0]) if args else 0
                test.click_ticket(index)

            elif cmd == "accept":
                test.accept_ticket()

            elif cmd == "depart":
                test.depart()

            elif cmd == "arrive":
                test.arrive()

            elif cmd == "fill":
                test.fill_form()

            elif cmd == "photos":
                count = int(args[0]) if args else 1
                test.upload_photos(count)

            elif cmd == "submit":
                test.submit()

            elif cmd == "shot":
                name = args[0] if args else None
                test.screenshot(name)

            else:
                print(f"❌ 未知命令: {cmd}")
                print("输入 'help' 查看可用命令")

        except KeyboardInterrupt:
            print("\n\n⚠️ 用户中断")
            test.close()
            break
        except Exception as e:
            print(f"❌ 错误: {e}")


if __name__ == "__main__":
    main()
