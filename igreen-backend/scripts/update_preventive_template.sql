-- ============================================
-- 更新 Preventive Maintenance 模板
-- 执行方式: mysql -u root -p igreen_db < update_preventive_template.sql
-- ============================================

UPDATE templates
SET
    step_config = '[
  {
    "id": "step-1",
    "name": "MDB Cabinet Check",
    "description": "检查主配电箱状态",
    "sortOrder": 1,
    "fields": [
      {
        "id": "field-inspection-1",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "MDB 柜体检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-2",
    "name": "Fire Extinguisher Check",
    "description": "检查消防设备状态",
    "sortOrder": 2,
    "fields": [
      {
        "id": "field-inspection-2",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "灭火器检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-3",
    "name": "Ground Condition Check",
    "description": "检查地面条件",
    "sortOrder": 3,
    "fields": [
      {
        "id": "field-inspection-3",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "地面条件检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-4",
    "name": "Charging Gun & Cable Check",
    "description": "检查充电枪和电缆",
    "sortOrder": 4,
    "fields": [
      {
        "id": "field-inspection-4",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "充电枪和电缆检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-5",
    "name": "Charging Input Line Check",
    "description": "检查充电输入线路",
    "sortOrder": 5,
    "fields": [
      {
        "id": "field-inspection-5",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "充电输入线路检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-6",
    "name": "Mainboard Terminals Check",
    "description": "检查主板接线端子",
    "sortOrder": 6,
    "fields": [
      {
        "id": "field-inspection-6",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "主板接线端子检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-7",
    "name": "Display Screen Check",
    "description": "检查显示屏状态",
    "sortOrder": 7,
    "fields": [
      {
        "id": "field-inspection-7",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "显示屏检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-8",
    "name": "Indicator Lights Check",
    "description": "检查指示灯状态",
    "sortOrder": 8,
    "fields": [
      {
        "id": "field-inspection-8",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "指示灯检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-9",
    "name": "Communication Functions Check",
    "description": "检查通信功能",
    "sortOrder": 9,
    "fields": [
      {
        "id": "field-inspection-9",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "通信功能检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-10",
    "name": "Emergency Stop Button Check",
    "description": "检查急停按钮",
    "sortOrder": 10,
    "fields": [
      {
        "id": "field-inspection-10",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "急停按钮检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-11",
    "name": "Charging Module Check",
    "description": "检查充电模块",
    "sortOrder": 11,
    "fields": [
      {
        "id": "field-inspection-11",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "充电模块检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-12",
    "name": "Surge Protector Check",
    "description": "检查浪涌保护器",
    "sortOrder": 12,
    "fields": [
      {
        "id": "field-inspection-12",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "浪涌保护器检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-13",
    "name": "Dust Screen Check",
    "description": "检查防尘网",
    "sortOrder": 13,
    "fields": [
      {
        "id": "field-inspection-13",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "防尘网检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-14",
    "name": "Historical Records Check",
    "description": "检查历史记录",
    "sortOrder": 14,
    "fields": [
      {
        "id": "field-inspection-14",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "历史记录检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-15",
    "name": "Backend Communication Check",
    "description": "检查后台通信",
    "sortOrder": 15,
    "fields": [
      {
        "id": "field-inspection-15",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "后台通信检查结果",
        "required": true,
        "config": {}
      }
    ]
  },
  {
    "id": "step-16",
    "name": "Contactor & Charging Action Test",
    "description": "接触器和充电动作测试",
    "sortOrder": 16,
    "fields": [
      {
        "id": "field-inspection-16",
        "name": "Inspection Result",
        "type": "INSPECTION",
        "description": "接触器和充电动作测试结果",
        "required": true,
        "config": {}
      }
    ]
  }
]',
    updated_at = NOW()
WHERE id = '292c7267-98fd-42ff-9a4e-a76ffa552618';