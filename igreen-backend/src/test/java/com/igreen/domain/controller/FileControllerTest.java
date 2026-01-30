package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.FileUploadResponse;
import com.igreen.domain.service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("文件管理控制器测试")
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileService fileService;

    private MockMultipartFile testFile;
    private FileUploadResponse uploadResponse;

    @BeforeEach
    void setUp() {
        testFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        uploadResponse = new FileUploadResponse(
                "file-123",
                "/uploads/file-123.jpg",
                "test.jpg",
                "image/jpeg",
                20
        );
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("上传文件应成功返回文件信息")
    void uploadFile_ShouldReturnFileInfo() throws Exception {
        when(fileService.uploadFile(any(), anyString())).thenReturn(uploadResponse);

        mockMvc.perform(multipart("/api/files/upload")
                        .file(testFile)
                        .param("fieldType", "photo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("file-123"))
                .andExpect(jsonPath("$.data.url").value("/uploads/file-123.jpg"))
                .andExpect(jsonPath("$.data.name").value("test.jpg"))
                .andExpect(jsonPath("$.data.type").value("image/jpeg"))
                .andExpect(jsonPath("$.data.size").value(20));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("上传文件时fieldType为空应仍然成功")
    void uploadFile_WithoutFieldType_ShouldSucceed() throws Exception {
        when(fileService.uploadFile(any(), eq(null))).thenReturn(uploadResponse);

        mockMvc.perform(multipart("/api/files/upload")
                        .file(testFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("删除文件应成功")
    void deleteFile_ShouldSucceed() throws Exception {
        mockMvc.perform(delete("/api/files/file-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("文件不存在时删除应返回错误")
    void deleteFile_WhenFileNotFound_ShouldReturnError() throws Exception {
        doThrow(new BusinessException(ErrorCode.FILE_NOT_FOUND))
                .when(fileService).deleteFile(anyString());

        mockMvc.perform(delete("/api/files/nonexistent"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("上传空文件应返回错误")
    void uploadFile_WhenFileEmpty_ShouldReturnError() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "",
                "image/jpeg",
                new byte[0]
        );

        when(fileService.uploadFile(any(), anyString()))
                .thenThrow(new BusinessException(ErrorCode.FILE_EMPTY));

        mockMvc.perform(multipart("/api/files/upload")
                        .file(emptyFile)
                        .param("fieldType", "photo"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("上传超大文件应返回错误")
    void uploadFile_WhenFileTooLarge_ShouldReturnError() throws Exception {
        when(fileService.uploadFile(any(), anyString()))
                .thenThrow(new BusinessException(ErrorCode.FILE_TOO_LARGE));

        mockMvc.perform(multipart("/api/files/upload")
                        .file(testFile)
                        .param("fieldType", "photo"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
