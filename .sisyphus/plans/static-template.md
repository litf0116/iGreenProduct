# 计划：将导入模板改为静态资源

## 背景
当前 `downloadTemplate()` 方法动态生成 Excel 模板，效率较低。
用户要求将模板文件放到 resources 目录，接口直接返回静态文件。

## 已完成
- ✅ 模板文件已创建并保存到: `src/main/resources/static/sites_import_template.xlsx`

## 待执行任务

### 1. 修改 SiteImportExportService

**文件**: `igreen-backend/src/main/java/com/igreen/domain/service/SiteImportExportService.java`

**修改内容**:
```java
// 删除以下方法:
private List<SiteTemplateDTO> createTemplateData() { ... }

// 修改 downloadTemplate 方法:
public void downloadTemplate(HttpServletResponse response) {
    try (InputStream is = getClass().getClassLoader()
            .getResourceAsStream("static/sites_import_template.xlsx")) {
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", 
            "attachment;filename=sites_import_template.xlsx");
        
        Workbook workbook = new XSSFWorkbook(is);
        workbook.write(response.getOutputStream());
        workbook.close();
        
    } catch (Exception e) {
        throw new RuntimeException("下载模板失败: " + e.getMessage());
    }
}
```

### 2. 编译测试

```bash
cd igreen-backend
mvn compile -Dmaven.test.skip=true
java -jar target/igreen-backend-1.0.0-SNAPSHOT.jar
```

### 3. 验证

```bash
curl http://localhost:8000/api/sites/export/template -o template.xlsx
file template.xlsx  # 应显示: Microsoft OOXML
```

## 文件变更

| 操作 | 文件路径 |
|------|----------|
| 修改 | `SiteImportExportService.java` |
| 新增 | `src/main/resources/static/sites_import_template.xlsx` |
