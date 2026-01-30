-- ============================================
-- Site 模块测试数据生成脚本
-- 执行方式: mysql -u root -p igreen_db < generate_site_test_data.sql
-- ============================================

-- ============================================
-- 清理现有测试数据（可选）
-- ============================================
-- DELETE FROM sites WHERE id LIKE 'test-site-%';

-- ============================================
-- 1. 站点级别配置测试数据
-- ============================================
INSERT INTO site_level_configs (id, level_name, description, max_concurrent_tickets, escalation_time_hours, created_at, updated_at) VALUES
('slc-test-001', 'VIP 站点', 'VIP 级别站点配置，高优先级服务', 10, 2, NOW(), NOW()),
('slc-test-002', 'Enterprise 站点', '企业级站点配置', 8, 3, NOW(), NOW()),
('slc-test-003', 'Normal 站点', '普通站点配置', 5, 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE level_name = level_name;

-- ============================================
-- 2. VIP 级别站点测试数据
-- ============================================
INSERT INTO sites (id, name, address, level, status, created_at, updated_at) VALUES
-- 上海地区 VIP 站点
('test-site-vip-001', '上海陆家嘴超级充电站', '上海市浦东新区陆家嘴环路1000号东方明珠旁', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-002', '上海虹桥枢纽充电站', '上海市闵行区申虹路2800号虹桥机场内', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-003', '上海张江高科充电站', '上海市浦东新区张江高科技园区科苑路88号', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-004', '上海外滩金融中心站', '上海市黄浦区中山东一路外滩金融中心', 'vip', 'OFFLINE', NOW(), NOW()),
('test-site-vip-005', '上海徐家汇商圈充电站', '上海市徐汇区漕溪北路88号', 'vip', 'MAINTENANCE', NOW(), NOW()),

-- 北京地区 VIP 站点
('test-site-vip-006', '北京国贸CBD超级站', '北京市朝阳区建国门外大街1号国贸中心', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-007', '北京中关村科技园站', '北京市海淀区中关村大街27号中关村大厦', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-008', '北京三里屯时尚站', '北京市朝阳区三里屯太古里', 'vip', 'OFFLINE', NOW(), NOW()),

-- 深圳地区 VIP 站点
('test-site-vip-009', '深圳福田中心区站', '深圳市福田区深南大道6008号特区报业大厦', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-010', '深圳南山科技园站', '深圳市南山区科技园南区软件产业基地', 'vip', 'ONLINE', NOW(), NOW()),

-- 广州地区 VIP 站点
('test-site-vip-011', '广州天河体育中心站', '广州市天河区体育西路1号天河体育中心', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-012', '广州珠江新城站', '广州市天河区珠江新城花城大道85号', 'vip', 'OFFLINE', NOW(), NOW()),

-- 杭州地区 VIP 站点
('test-site-vip-013', '杭州西湖文化广场站', '杭州市下城区中山北路581号西湖文化广场', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-014', '杭州未来科技城站', '杭州市余杭区文一西路998号未来科技城', 'vip', 'MAINTENANCE', NOW(), NOW()),

-- 成都地区 VIP 站点
('test-site-vip-015', '成都春熙路商圈站', '成都市锦江区总府路2号春熙路步行街', 'vip', 'ONLINE', NOW(), NOW()),
('test-site-vip-016', '成都高新区金融城站', '成都市高新区天府大道北段966号', 'vip', 'OFFLINE', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- 3. Enterprise 级别站点测试数据
-- ============================================
INSERT INTO sites (id, name, address, level, status, created_at, updated_at) VALUES
-- 上海地区 Enterprise 站点
('test-site-ent-001', '上海嘉定汽车城充电站', '上海市嘉定区安亭镇博园路7575号', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-002', '上海松江大学城站', '上海市松江区文翔路1550号松江大学城', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-003', '上海临港新城充电站', '上海市浦东新区临港新城环湖西一路', 'enterprise', 'OFFLINE', NOW(), NOW()),
('test-site-ent-004', '上海闵行工业区站', '上海市闵行区剑川路950号', 'enterprise', 'MAINTENANCE', NOW(), NOW()),

-- 北京地区 Enterprise 站点
('test-site-ent-005', '北京亦庄开发区站', '北京市大兴区亦庄经济技术开发区科创十一街', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-006', '北京顺义空港物流园站', '北京市顺义区空港物流园', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-007', '北京昌平未来科学城站', '北京市昌平区未来科学城', 'enterprise', 'OFFLINE', NOW(), NOW()),

-- 深圳地区 Enterprise 站点
('test-site-ent-008', '深圳宝安中心区站', '深圳市宝安区宝城6区', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-009', '深圳龙华商务中心站', '深圳市龙华区民治街道人民路', 'enterprise', 'MAINTENANCE', NOW(), NOW()),

-- 广州地区 Enterprise 站点
('test-site-ent-010', '广州琶洲会展中心站', '广州市海珠区琶洲会展中心', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-011', '广州番禺万博商圈站', '广州市番禺区万博商务区', 'enterprise', 'OFFLINE', NOW(), NOW()),

-- 杭州地区 Enterprise 站点
('test-site-ent-012', '杭州滨江高新区站', '杭州市滨江区江南大道588号', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-013', '杭州余杭临平新城站', '杭州市余杭区临平新城', 'enterprise', 'ONLINE', NOW(), NOW()),

-- 成都地区 Enterprise 站点
('test-site-ent-014', '成都武侯新城站', '成都市武侯区武侯新城武科东一路', 'enterprise', 'ONLINE', NOW(), NOW()),
('test-site-ent-015', '成都双流航空港站', '成都市双流区航空港物流园', 'enterprise', 'OFFLINE', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- 4. Normal 级别站点测试数据
-- ============================================
INSERT INTO sites (id, name, address, level, status, created_at, updated_at) VALUES
-- 上海地区 Normal 站点
('test-site-norm-001', '上海浦东金桥充电站', '上海市浦东新区金桥路', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-002', '上海杨浦五角场站', '上海市杨浦区五角场', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-003', '上海普陀长风公园站', '上海市普陀区长风公园', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-004', '上海静安寺商圈站', '上海市静安区静安寺', 'normal', 'OFFLINE', NOW(), NOW()),
('test-site-norm-005', '上海徐汇田林新村站', '上海市徐汇区田林新村', 'normal', 'MAINTENANCE', NOW(), NOW()),
('test-site-norm-006', '上海虹口足球场站', '上海市虹口区东江湾路', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-007', '上海黄浦区人民广场站', '上海市黄浦区人民广场', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-008', '上海长宁中山公园站', '上海市长宁区中山公园', 'normal', 'ONLINE', NOW(), NOW()),

-- 北京地区 Normal 站点
('test-site-norm-009', '北京西单商圈充电站', '北京市西城区西单', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-010', '北京东直门交通枢纽站', '北京市东城区东直门', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-011', '北京公主坟新兴桥站', '北京市海淀区公主坟', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-012', '北京崇文门新世界站', '北京市东城区崇文门', 'normal', 'OFFLINE', NOW(), NOW()),
('test-site-norm-013', '北京丰台科技园站', '北京市丰台区科技园', 'normal', 'MAINTENANCE', NOW(), NOW()),
('test-site-norm-014', '北京通州万达广场站', '北京市通州区万达广场', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-015', '北京石景山鲁谷站', '北京市石景山区鲁谷', 'normal', 'ONLINE', NOW(), NOW()),

-- 深圳地区 Normal 站点
('test-site-norm-016', '深圳罗湖东门步行街站', '深圳市罗湖区东门', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-017', '深圳福田华强北站', '深圳市福田区华强北', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-018', '深圳龙岗中心城站', '深圳市龙岗区中心城', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-019', '深圳盐田大梅沙站', '深圳市盐田区大梅沙', 'normal', 'OFFLINE', NOW(), NOW()),
('test-site-norm-020', '深圳光明新区站', '深圳市光明新区', 'normal', 'MAINTENANCE', NOW(), NOW()),

-- 广州地区 Normal 站点
('test-site-norm-021', '广州北京路步行街站', '广州市越秀区北京路', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-022', '广州荔湾区上下九站', '广州市荔湾区上下九', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-023', '广州白云机场候机楼站', '广州市白云国际机场', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-024', '广州黄埔科学城站', '广州市黄埔区科学城', 'normal', 'OFFLINE', NOW(), NOW()),
('test-site-norm-025', '广州花都白云机场北站', '广州市花都区白云机场北', 'normal', 'MAINTENANCE', NOW(), NOW()),

-- 杭州地区 Normal 站点
('test-site-norm-026', '杭州上城区湖滨站', '杭州市上城区湖滨', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-027', '杭州拱墅区大关站', '杭州市拱墅区大关', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-028', '杭州萧山区市心路站', '杭州市萧山区市心路', 'normal', 'OFFLINE', NOW(), NOW()),
('test-site-norm-029', '杭州下城区武林广场站', '杭州市下城区武林广场', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-030', '杭州滨江区星光大道站', '杭州市滨江区星光大道', 'normal', 'MAINTENANCE', NOW(), NOW()),

-- 成都地区 Normal 站点
('test-site-norm-031', '成都成华区建设路站', '成都市成华区建设路', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-032', '成都青羊区骡马市站', '成都市青羊区骡马市', 'normal', 'ONLINE', NOW(), NOW()),
('test-site-norm-033', '成都锦江区盐市口站', '成都市锦江区盐市口', 'normal', 'OFFLINE', NOW(), NOW()),
('test-site-norm-034', '成都金牛区营门口站', '成都市金牛区营门口', 'normal', 'MAINTENANCE', NOW(), NOW()),
('test-site-norm-035', '成都高新区环球中心站', '成都市高新区环球中心', 'normal', 'ONLINE', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- 5. 数据统计说明
-- ============================================
-- 总计: 66 个测试站点
-- - VIP 站点: 16 个
--   - ONLINE: 10 个
--   - OFFLINE: 4 个
--   - UNDER_CONSTRUCTION: 2 个
-- - Enterprise 站点: 15 个
--   - ONLINE: 9 个
--   - OFFLINE: 4 个
--   - UNDER_CONSTRUCTION: 2 个
-- - Normal 站点: 35 个
--   - ONLINE: 20 个
--   - OFFLINE: 8 个
--   - UNDER_CONSTRUCTION: 7 个

-- 按地区分布:
-- - 上海: 19 个 (7 VIP + 4 Enterprise + 8 Normal)
-- - 北京: 14 个 (3 VIP + 3 Enterprise + 8 Normal)
-- - 深圳: 9 个 (2 VIP + 2 Enterprise + 5 Normal)
-- - 广州: 10 个 (2 VIP + 2 Enterprise + 6 Normal)
-- - 杭州: 9 个 (2 VIP + 2 Enterprise + 5 Normal)
-- - 成都: 9 个 (2 VIP + 2 Enterprise + 5 Normal)
