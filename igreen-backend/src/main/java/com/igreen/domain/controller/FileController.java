package com.igreen.domain.controller;

import com.igreen.common.result.Result;
import com.igreen.domain.dto.FileUploadResponse;
import com.igreen.domain.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Tag(name = "文件管理", description = "文件上传、删除接口")
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    public final FileService fileService;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public ResponseEntity<Result<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fieldType", required = false) String fieldType) throws IOException {
        return ResponseEntity.ok(Result.success(fileService.uploadFile(file, fieldType)));
    }

    @Operation(summary = "删除文件")
    @DeleteMapping("/{id}")
    public ResponseEntity<Result<Void>> deleteFile(@PathVariable String id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok(Result.successResult());
    }
}
