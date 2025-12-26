package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.FileUploadResponse;
import com.igreen.domain.entity.File;
import com.igreen.domain.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final FileRepository fileRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-size:10485760}")
    private long maxFileSize;

    @Transactional
    public FileUploadResponse uploadFile(MultipartFile file, String fieldType) throws IOException {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_EMPTY);
        }

        if (file.getSize() > maxFileSize) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE);
        }

        String fileId = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String uniqueFilename = fileId + extension;

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        String fileUrl = "/" + uploadDir + "/" + uniqueFilename;

        File fileEntity = File.builder()
                .id(fileId)
                .name(originalFilename)
                .url(fileUrl)
                .type(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .size((int) file.getSize())
                .fieldType(fieldType)
                .build();

        fileEntity = fileRepository.save(fileEntity);

        return new FileUploadResponse(
                fileEntity.getId(),
                fileEntity.getUrl(),
                fileEntity.getName(),
                fileEntity.getType(),
                fileEntity.getSize()
        );
    }

    @Transactional
    public void deleteFile(String fileId) {
        File fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));

        Path filePath = Paths.get("." + fileEntity.getUrl());
        if (Files.exists(filePath)) {
            try {
                Files.delete(filePath);
            } catch (IOException e) {
                log.error("Error deleting physical file: {}", fileEntity.getUrl(), e);
            }
        }

        fileRepository.delete(fileEntity);
    }
}
