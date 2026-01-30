package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.FileUploadResponse;
import com.igreen.domain.entity.File;
import com.igreen.domain.mapper.FileMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("文件服务测试")
class FileServiceTest {

    private FileService fileService;
    private FileMapper fileMapper;

    @TempDir
    Path tempDir;

    private MockMultipartFile testFile;

    @BeforeEach
    void setUp() {
        fileMapper = mock(FileMapper.class);
        fileService = new FileService(fileMapper);

        // 使用反射设置上传目录到临时目录
        ReflectionTestUtils.setField(fileService, "uploadDir", tempDir.toString());
        ReflectionTestUtils.setField(fileService, "maxFileSize", 10485760L); // 10MB

        testFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );
    }

    @Test
    @DisplayName("上传文件应成功保存并返回响应")
    void uploadFile_ShouldSaveFileAndReturnResponse() throws IOException {
        // Given
        when(fileMapper.insert(any(File.class))).thenReturn(1);

        // When
        FileUploadResponse response = fileService.uploadFile(testFile, "photo");

        // Then
        assertNotNull(response);
        assertNotNull(response.id());
        assertTrue(response.url().contains(tempDir.toString()));
        assertEquals("test.jpg", response.name());
        assertEquals("image/jpeg", response.type());
        assertEquals(18, response.size()); // "test image content" is 18 bytes

        // Verify file was saved
        assertTrue(Files.exists(Path.of(tempDir.toString(), response.id() + ".jpg")));

        // Verify database insert was called
        ArgumentCaptor<File> fileCaptor = ArgumentCaptor.forClass(File.class);
        verify(fileMapper).insert(fileCaptor.capture());
        assertEquals("test.jpg", fileCaptor.getValue().getName());
        assertEquals("photo", fileCaptor.getValue().getFieldType());
    }

    @Test
    @DisplayName("上传空文件应抛出异常")
    void uploadFile_WhenFileEmpty_ShouldThrowException() {
        // Given
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "",
                "image/jpeg",
                new byte[0]
        );

        // When & Then
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> fileService.uploadFile(emptyFile, "photo")
        );

        assertEquals(ErrorCode.FILE_EMPTY.getCode(), exception.getCode());
        verify(fileMapper, never()).insert(any(File.class));
    }

    @Test
    @DisplayName("上传超大文件应抛出异常")
    void uploadFile_WhenFileTooLarge_ShouldThrowException() {
        // Given
        ReflectionTestUtils.setField(fileService, "maxFileSize", 100L); // 设置为100字节
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                new byte[200]
        );

        // When & Then
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> fileService.uploadFile(largeFile, "photo")
        );

        assertEquals(ErrorCode.FILE_TOO_LARGE.getCode(), exception.getCode());
        verify(fileMapper, never()).insert(any(File.class));
    }

    @Test
    @DisplayName("上传无扩展名文件应正常处理")
    void uploadFile_WithoutExtension_ShouldHandleCorrectly() throws IOException {
        // Given
        MockMultipartFile noExtFile = new MockMultipartFile(
                "file",
                "filename",
                "image/jpeg",
                "content".getBytes()
        );
        when(fileMapper.insert(any(File.class))).thenReturn(1);

        // When
        FileUploadResponse response = fileService.uploadFile(noExtFile, "document");

        // Then
        assertNotNull(response);
        // 文件名不应包含点
        assertFalse(response.url().contains("."));
    }

    @Test
    @DisplayName("删除文件应成功删除物理文件和数据库记录")
    void deleteFile_ShouldDeletePhysicalFileAndDatabaseRecord() throws IOException {
        // Given - 先创建一个测试文件
        String fileId = "test-file-123";
        String fileName = fileId + ".jpg";
        // 创建相对于当前目录的上传目录结构
        Path uploadDir = Path.of(".").resolve("uploads");
        Files.createDirectories(uploadDir);
        Path testFilePath = uploadDir.resolve(fileName);
        Files.writeString(testFilePath, "test content");

        File fileEntity = File.builder()
                .id(fileId)
                .name("test.jpg")
                .url("/uploads/" + fileName)  // Use URL format that FileService expects
                .type("image/jpeg")
                .size(12)
                .fieldType("photo")
                .build();

        when(fileMapper.selectById(fileId)).thenReturn(fileEntity);
        when(fileMapper.deleteById(fileId)).thenReturn(1);

        // When
        fileService.deleteFile(fileId);

        // Then
        assertFalse(Files.exists(testFilePath));
        verify(fileMapper).deleteById(fileId);

        // Clean up
        Files.deleteIfExists(uploadDir);
    }

    @Test
    @DisplayName("删除不存在的文件应抛出异常")
    void deleteFile_WhenFileNotFound_ShouldThrowException() {
        // Given
        when(fileMapper.selectById(anyString())).thenReturn(null);

        // When & Then
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> fileService.deleteFile("nonexistent-file")
        );

        assertEquals(ErrorCode.FILE_NOT_FOUND.getCode(), exception.getCode());
        verify(fileMapper, never()).deleteById(anyString());
    }

    @Test
    @DisplayName("删除文件时物理文件删除失败应记录错误但仍删除数据库记录")
    void deleteFile_WhenPhysicalFileDeleteFails_ShouldStillDeleteDatabaseRecord() {
        // Given - 不创建物理文件
        String fileId = "test-file-456";

        File fileEntity = File.builder()
                .id(fileId)
                .name("test.jpg")
                .url("/nonexistent/path/test.jpg")
                .type("image/jpeg")
                .size(0)
                .fieldType("photo")
                .build();

        when(fileMapper.selectById(fileId)).thenReturn(fileEntity);
        when(fileMapper.deleteById(fileId)).thenReturn(1);

        // When - 不应抛出异常
        assertDoesNotThrow(() -> fileService.deleteFile(fileId));

        // Then
        verify(fileMapper).deleteById(fileId);
    }

    @Test
    @DisplayName("上传文件时应自动创建上传目录")
    void uploadFile_ShouldCreateUploadDirectoryIfNeeded() throws IOException {
        // Given
        Path nonExistentDir = tempDir.resolve("subdir").resolve("uploads");
        ReflectionTestUtils.setField(fileService, "uploadDir", nonExistentDir.toString());
        when(fileMapper.insert(any(File.class))).thenReturn(1);

        // When
        FileUploadResponse response = fileService.uploadFile(testFile, "photo");

        // Then
        assertNotNull(response);
        assertTrue(Files.exists(nonExistentDir));
    }

    @Test
    @DisplayName("上传没有contentType的文件应使用默认类型")
    void uploadFile_WhenNoContentType_ShouldUseDefaultType() throws IOException {
        // Given
        MockMultipartFile noContentTypeFile = new MockMultipartFile(
                "file",
                "test.bin",
                null,
                "binary content".getBytes()
        );
        when(fileMapper.insert(any(File.class))).thenReturn(1);

        // When
        FileUploadResponse response = fileService.uploadFile(noContentTypeFile, "binary");

        // Then
        assertEquals("application/octet-stream", response.type());
    }
}
