"""
测试部署服务的文件上传接口
"""

import requests
import os

# 配置
BASE_URL = "http://43.255.212.68:8080"
USERNAME = "engineer"
PASSWORD = "engineer123"
TEST_FILE_PATH = "/Users/mac/workspace/iGreenProduct/test-upload.txt"

# 创建测试文件
with open(TEST_FILE_PATH, "w") as f:
    f.write("This is a test file for upload verification.\n")
    f.write(f"Created at: 2026-02-08\n")
    f.write("Test content for file upload.\n")


def login():
    """登录获取 token"""
    url = f"{BASE_URL}/api/auth/login"
    data = {"username": USERNAME, "password": PASSWORD}
    response = requests.post(url, json=data)
    print(f"登录响应: {response.status_code}")
    if response.ok:
        result = response.json()
        if result.get("success") and result.get("data"):
            return result["data"]["accessToken"]
    return None


def upload_file(token, file_path):
    """上传文件"""
    url = f"{BASE_URL}/api/files/upload"
    headers = {"Authorization": f"Bearer {token}"}

    with open(file_path, "rb") as f:
        files = {"file": ("test-image.jpg", f, "image/jpeg")}
        data = {"fieldType": "photo"}

        response = requests.post(url, headers=headers, files=files, data=data)

    print(f"\n上传响应状态: {response.status_code}")
    print(f"上传响应内容: {response.text}")
    return response.ok


def main():
    print("=" * 50)
    print("文件上传接口测试")
    print("=" * 50)

    # 1. 登录
    print("\n1. 登录获取 token...")
    token = login()
    if not token:
        print("❌ 登录失败")
        return

    print("✅ 登录成功")

    # 2. 上传文件
    print("\n2. 上传文件...")
    success = upload_file(token, TEST_FILE_PATH)
    if success:
        print("✅ 文件上传成功")
    else:
        print("❌ 文件上传失败")

    # 清理测试文件
    if os.path.exists(TEST_FILE_PATH):
        os.remove(TEST_FILE_PATH)

    print("\n" + "=" * 50)
    print("测试完成")
    print("=" * 50)


if __name__ == "__main__":
    main()
