package com.example.hamster_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.hamster_service.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(String imageUrl) {
        try {
            // 1. Mở stream từ URL
            URL url = new URL(imageUrl);
            InputStream inputStream = url.openStream();

            // 2. Đọc stream -> byte[]
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[1024];
            int nRead;

            while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }

            buffer.flush();
            byte[] imageBytes = buffer.toByteArray();

            // 3. Upload bằng byte[]
            Map uploadResult = cloudinary.uploader().upload(imageBytes, ObjectUtils.emptyMap());

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("Error uploading image to Cloudinary: " + e.getMessage());
        }
    }
}
