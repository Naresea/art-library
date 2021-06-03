package de.naresea.art_library_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.naresea.art_library_backend.config.ArtLibraryConfig;
import de.naresea.art_library_backend.service.model.ImageCreate;
import de.naresea.art_library_backend.service.model.UploadMetadata;
import lombok.RequiredArgsConstructor;
import net.lingala.zip4j.ZipFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ImageImportService {

    private final ThreadpoolService threadpoolService;

    private final ImageCrudService imageCrudService;

    private final ArtLibraryConfig config;

    public String importMultipartImageZip(final MultipartFile multipartFile) {
        final var imageCrudService = this.imageCrudService;
        final var uuid = UUID.randomUUID().toString();
        final var file = this.writeMultipartToDisk(multipartFile, uuid);
        final var zipDir = this.extractZip(file, uuid);

        this.threadpoolService.getExecutor().submit(() -> {
            var metadata = ImageImportService.readMetadata(zipDir);
            ImageImportService.importImages(zipDir, metadata, imageCrudService, uuid);
            this.deleteTempDir(uuid);
        });

        return uuid;
    }

    private void deleteTempDir(String uuid) {
        var tempDir = this.config.getTmpDirectory();
        var extractPath = Paths.get(tempDir, uuid);
        var tempFile = new File(Paths.get(tempDir, uuid + ".tmp").toString());
        try {
            Files.deleteIfExists(tempFile.toPath());
            deleteDir(new File(extractPath.toString()));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void deleteDir(File dir) {
        File[] files = dir.listFiles();
        if(files != null) {
            for (final File file : files) {
                deleteDir(file);
            }
        }
        dir.delete();
    }

    private static boolean importImages(
            Optional<File> zipDir,
            Optional<UploadMetadata> metadata,
            ImageCrudService imageCrudService,
            String uuid
    ) {
        if (zipDir.isEmpty() || metadata.isEmpty()) {
            return false;
        }
        var meta = metadata.get();
        var dir = zipDir.get();
        var metaFiles = meta.getFiles();

        ProgressService.reportProgress(metaFiles.size(), 0, 0, uuid);

        var imageCreates = metaFiles.keySet().stream().map(key -> {
            var value = metaFiles.get(key);
            var tagsForKey = value != null ? value.getTags() : new HashSet<String>();
            var categories = value != null ? value.getCategories() : new HashSet<String>();

            tagsForKey.addAll(meta.getTags());
            categories.addAll(meta.getCategories());

            var imageCreate = new ImageCreate();
            imageCreate.setTags(tagsForKey);
            imageCreate.setCategories(categories);
            imageCreate.setTitle(key);
            imageCreate.setName(UUID.randomUUID().toString());
            imageCreate.setType("image/webp");
            imageCreate.setDescription(meta.getDescription());
            imageCreate.setImageFile(Optional.of(Paths.get(dir.getPath(), key).toFile()));
            return imageCreate;
        }).collect(Collectors.toList());
        imageCrudService.createImages(imageCreates, uuid);
        ProgressService.reportProgress(metaFiles.size(), metaFiles.size(), 0, uuid);
        return true;
    }

    private static Optional<UploadMetadata> readMetadata(Optional<File> zipDir) {
        if (zipDir.isEmpty()) {
            return Optional.empty();
        }
        try {
            var metadataFile = new File(Paths.get(zipDir.get().getPath(), "al-metadata.json").toString());
            var om = new ObjectMapper();
            var result = om.readValue(metadataFile, UploadMetadata.class);
            return Optional.of(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private Optional<File> extractZip(Optional<File> file, String uuid) {
        if (file.isEmpty()) {
            return Optional.empty();
        }
        try {
            var tempDir = this.config.getTmpDirectory();
            var extractPath = Paths.get(tempDir, uuid);
            Files.createDirectories(extractPath);
            var zipFile = new ZipFile(file.get());
            zipFile.extractAll(extractPath.toString());
            return Optional.of(new File(extractPath.toString()));
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private Optional<File> writeMultipartToDisk(MultipartFile multipartFile, String uuid) {
        try {
            var tempDir = this.config.getTmpDirectory();
            Files.createDirectories(Paths.get(tempDir));
            var tempFile = new File(Paths.get(tempDir, uuid + ".tmp").toString());
            InputStream initialStream = multipartFile.getInputStream();
            byte[] buffer = new byte[initialStream.available()];
            initialStream.read(buffer);

            try (OutputStream os = new FileOutputStream(tempFile)) {
                os.write(buffer);
            }
            return Optional.of(tempFile);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }
}
