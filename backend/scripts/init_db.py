"""
数据库初始化脚本
创建初始数据（管理员用户、默认配置、示例模板等）
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import datetime, timedelta

from app.core.database import SessionLocal, init_db
from app.models.user import User, UserRole, UserStatus
from app.models.group import Group, GroupStatus
from app.models.site import Site, SiteStatus
from app.models.config import SLAConfig, ProblemType, SiteLevelConfig
from app.models.ticket import Priority
from app.models.template import Template, TemplateStep, TemplateField, FieldType
from app.core.security import get_password_hash


def create_initial_data():
    """创建初始数据"""
    db = SessionLocal()

    try:
        # 检查是否已有数据
        existing_user = db.query(User).first()
        if existing_user:
            print("⚠️  Database already contains data. Skipping initialization.")
            return

        print("🚀 Initializing database with sample data...")

        # 1. 创建管理员用户
        admin_user = User(
            id=str(uuid.uuid4()),
            name="System Administrator",
            username="admin",
            email="admin@igreen.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )
        db.add(admin_user)
        print("✓ Created admin user (username: admin, password: admin123)")

        # 2. 创建演示用户
        demo_engineer = User(
            id=str(uuid.uuid4()),
            name="Demo Engineer",
            username="engineer",
            email="engineer@igreen.com",
            hashed_password=get_password_hash("engineer123"),
            role=UserRole.ENGINEER,
            status=UserStatus.ACTIVE
        )
        db.add(demo_engineer)

        demo_manager = User(
            id=str(uuid.uuid4()),
            name="Demo Manager",
            username="manager",
            email="manager@igreen.com",
            hashed_password=get_password_hash("manager123"),
            role=UserRole.MANAGER,
            status=UserStatus.ACTIVE
        )
        db.add(demo_manager)
        print("✓ Created demo users (engineer/manager)")

        # 3. 创建分组
        group1 = Group(
            id=str(uuid.uuid4()),
            name="Bangkok Maintenance Team",
            description="曼谷地区维护团队",
            tags=["Bangkok", "Maintenance"],
            status=GroupStatus.ACTIVE
        )
        db.add(group1)

        group2 = Group(
            id=str(uuid.uuid4()),
            name="Support Team",
            description="远程支持团队",
            tags=["Support", "Remote"],
            status=GroupStatus.ACTIVE
        )
        db.add(group2)

        # 将演示工程师分配到组
        demo_engineer.group_id = group1.id
        print("✓ Created groups")

        # 4. 创建站点
        sites_data = [
            {"name": "Central Plaza", "address": "123 Main Street, Bangkok, Thailand", "level": "vip"},
            {"name": "Shopping Mall B", "address": "456 Shopping Avenue, Bangkok, Thailand", "level": "normal"},
            {"name": "Office Complex C", "address": "789 Business Road, Bangkok, Thailand", "level": "vip"},
            {"name": "Airport Terminal E", "address": "Suvarnabhumi Airport, Samut Prakan, Thailand", "level": "vip"},
        ]

        for site_data in sites_data:
            site = Site(
                id=str(uuid.uuid4()),
                name=site_data["name"],
                address=site_data["address"],
                level=site_data["level"],
                status=SiteStatus.ONLINE
            )
            db.add(site)
        print("✓ Created sites")

        # 5. 创建SLA配置
        sla_configs = [
            {"priority": Priority.P1, "response_time": 30, "resolution_time": 240},    # P1: 30min response, 4h resolution
            {"priority": Priority.P2, "response_time": 60, "resolution_time": 480},    # P2: 1h response, 8h resolution
            {"priority": Priority.P3, "response_time": 120, "resolution_time": 1440},  # P3: 2h response, 24h resolution
            {"priority": Priority.P4, "response_time": 240, "resolution_time": 2880},  # P4: 4h response, 48h resolution
        ]

        for config_data in sla_configs:
            sla_config = SLAConfig(
                id=str(uuid.uuid4()),
                priority=config_data["priority"],
                response_time=config_data["response_time"],
                resolution_time=config_data["resolution_time"]
            )
            db.add(sla_config)
        print("✓ Created SLA configurations")

        # 6. 创建问题类型
        problem_types = [
            {"name": "Charging Station Not Starting", "description": "Charging station cannot start properly"},
            {"name": "Slow Charging", "description": "Charging speed is significantly lower than normal"},
            {"name": "Communication Failure", "description": "Device communication with server is abnormal"},
            {"name": "Display Malfunction", "description": "Screen cannot display properly or is black"},
            {"name": "Payment System Error", "description": "Payment function is not working"},
        ]

        for pt_data in problem_types:
            problem_type = ProblemType(
                id=str(uuid.uuid4()),
                name=pt_data["name"],
                description=pt_data["description"]
            )
            db.add(problem_type)
        print("✓ Created problem types")

        # 7. 创建站点级别配置
        site_levels = [
            {"name": "normal", "description": "Normal site", "sla_multiplier": 1.0},
            {"name": "vip", "description": "VIP site (SLA time halved)", "sla_multiplier": 0.5},
        ]

        for level_data in site_levels:
            site_level_config = SiteLevelConfig(
                id=str(uuid.uuid4()),
                name=level_data["name"],
                description=level_data["description"],
                sla_multiplier=level_data["sla_multiplier"]
            )
            db.add(site_level_config)
        print("✓ Created site level configurations")

        # 8. 创建示例模板 - Preventive Maintenance
        template_preventive = Template(
            id=str(uuid.uuid4()),
            name="Preventive Maintenance",
            description="Regular preventive maintenance to avoid failures"
        )
        db.add(template_preventive)

        # 添加预防性维护步骤
        preventive_steps = [
            {"name": "Cabinet Inspection", "desc": "Check cabinets for rust, leaks, and door handles", "order": 1},
            {"name": "Fire Safety Check", "desc": "Check fire extinguishers and monitoring equipment", "order": 2},
            {"name": "Ground & Drainage", "desc": "Check ground condition, drainage, and cleaning", "order": 3},
            {"name": "Cable & Gun Head", "desc": "Check charging cable and gun head for damage", "order": 4},
            {"name": "Completion", "desc": "Final verification and sign-off", "order": 5},
        ]

        for step_data in preventive_steps:
            step = TemplateStep(
                id=str(uuid.uuid4()),
                name=step_data["name"],
                description=step_data["desc"],
                order=step_data["order"],
                template_id=template_preventive.id
            )
            db.add(step)

            # 为每个步骤添加基本字段
            step_fields = [
                TemplateField(id=str(uuid.uuid4()), name="Status", type=FieldType.TEXT, required=True, step_id=step.id),
                TemplateField(id=str(uuid.uuid4()), name="Photo", type=FieldType.PHOTO, required=True, step_id=step.id),
            ]
            for field in step_fields:
                db.add(field)

        # 9. 创建Corrective Maintenance模板
        template_corrective = Template(
            id=str(uuid.uuid4()),
            name="Corrective Maintenance",
            description="Corrective maintenance for reported issues and failures"
        )
        db.add(template_corrective)

        corrective_steps = [
            {"name": "Issue Documentation", "desc": "Document the reported issue", "order": 1},
            {"name": "Diagnosis", "desc": "Diagnose the problem", "order": 2},
            {"name": "Repair Work", "desc": "Perform corrective repairs", "order": 3},
            {"name": "Testing & Verification", "desc": "Test the repaired equipment", "order": 4},
        ]

        for step_data in corrective_steps:
            step = TemplateStep(
                id=str(uuid.uuid4()),
                name=step_data["name"],
                description=step_data["desc"],
                order=step_data["order"],
                template_id=template_corrective.id
            )
            db.add(step)

        print("✓ Created templates")

        # 提交所有更改
        db.commit()
        print("\n✅ Database initialized successfully!")
        print("\nDefault users created:")
        print("  - Admin: username=admin, password=admin123")
        print("  - Engineer: username=engineer, password=engineer123")
        print("  - Manager: username=manager, password=manager123")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error initializing database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database tables...")
    init_db()
    print("✓ Tables created")

    print("\nCreating initial data...")
    create_initial_data()
