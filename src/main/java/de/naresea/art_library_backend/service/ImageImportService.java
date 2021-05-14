package de.naresea.art_library_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.naresea.art_library_backend.config.ArtLibraryConfig;
import de.naresea.art_library_backend.model.dto.UploadMetadata;
import de.naresea.art_library_backend.model.entity.ImageFile;
import de.naresea.art_library_backend.model.entity.ImageTag;
import de.naresea.art_library_backend.model.repository.ImageRepository;
import de.naresea.art_library_backend.model.repository.ImageTagRepository;
import lombok.Data;
import lombok.Value;
import net.coobird.thumbnailator.Thumbnails;
import net.lingala.zip4j.ZipFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ImageImportService {

    @Data
    @Value
    private static class TagImport {
        String key;
        Collection<ImageTag> tags;
    }

    private static final int SMALL_WIDTH_PX = 128;
    private static final int MED_WIDTH_PX = 256;
    private static final int BIG_WIDTH_PX = 512;

    @Autowired
    private ThreadpoolService threadpoolService;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    ImageTagRepository imageTagRepository;

    @Autowired
    private ArtLibraryConfig config;

    @Autowired
    private HashService hashService;

    public String importMultipartImageZip(final MultipartFile multipartFile) {
        final var imageRepository = this.imageRepository;
        final var config = this.config;
        final var hashService = this.hashService;
        final var uuid = UUID.randomUUID().toString();
        final var file = ImageImportService.writeMultipartToDisk(multipartFile, uuid, config);
        final var zipDir = ImageImportService.extractZip(file, uuid, config);

        this.threadpoolService.getExecutor().submit(new Runnable() {
            @Override
            public void run() {
                var metadata = ImageImportService.readMetadata(zipDir);
                ImageImportService.importImages(zipDir, metadata, imageRepository, imageTagRepository, hashService, uuid);
                ImageImportService.deleteTempDir(uuid, config);
            }
        });

        return uuid;
    }

    private static void deleteTempDir(String uuid, ArtLibraryConfig config) {
        var tempDir = config.getTempDirectory();
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
            Optional<Map<String, UploadMetadata>> metadata,
            ImageRepository imageRepository,
            ImageTagRepository imageTagRepository,
            HashService hashService,
            String uuid
    ) {
        if (zipDir.isEmpty() || metadata.isEmpty()) {
            return false;
        }
        var meta = metadata.get();
        var dir = zipDir.get();


        ProgressService.reportProgress(meta.size(), 0, 0, uuid);
        var success = new AtomicInteger(0);
        var failed = new AtomicInteger(0);

        meta.keySet().stream().map(key -> {
            var value = meta.get(key);
            var tagsForKey = value != null ? value.getTags() : new HashSet<String>();
            var savedTags = saveTagsToDatabase(
                    tagsForKey,
                    imageTagRepository.findByNameIn(tagsForKey),
                    imageTagRepository
            );
            return new TagImport(key, savedTags);
        }).forEach(tagImport -> {
            try {
                var imageData = getImageFile(dir, tagImport.getKey(), tagImport.getTags(), hashService);
                imageRepository.save(imageData);
                ProgressService.reportProgress(meta.size(), success.incrementAndGet(), failed.get(), uuid);
            } catch (Exception e) {
                e.printStackTrace();
                ProgressService.reportProgress(meta.size(), success.get(), failed.incrementAndGet(), uuid);
            }
        });
        return true;
    }

    private static ImageFile getImageFile(final File dir, final String key, final Collection<ImageTag> savedTags, final HashService hashService) throws IOException {
        var rawImage = Files.readAllBytes(Paths.get(dir.getPath(), key));
        var hash = hashService.getHashSum(rawImage);
        var bis = new ByteArrayInputStream(rawImage);
        var bufferedImage = ImageIO.read(bis);
        var webpImage = writeWebp(bufferedImage);

        var big = writeWebp(Thumbnails.of(bufferedImage).size(BIG_WIDTH_PX, BIG_WIDTH_PX).keepAspectRatio(true).asBufferedImage());
        var med = writeWebp(Thumbnails.of(bufferedImage).size(MED_WIDTH_PX, MED_WIDTH_PX).keepAspectRatio(true).asBufferedImage());
        var small = writeWebp(Thumbnails.of(bufferedImage).size(SMALL_WIDTH_PX, SMALL_WIDTH_PX).keepAspectRatio(true).asBufferedImage());

        var imageForDatabase = new ImageFile(
                UUID.randomUUID() + ".webp",
                "image/webp",
                webpImage
        );

        imageForDatabase.setTags(new HashSet<>(savedTags));
        imageForDatabase.setThumbnailBig(big);
        imageForDatabase.setThumbnailMedium(med);
        imageForDatabase.setThumbnailSmall(small);
        imageForDatabase.setImagehash(hash);
        return imageForDatabase;
    }

    private static synchronized Set<ImageTag> saveTagsToDatabase(Collection<String> tags, Collection<ImageTag> existingTags, ImageTagRepository imageTagRepository) {
        var tagsToSave = tags.stream()
                .filter(t -> existingTags.stream().noneMatch(tag -> tag.getName().equals(t)))
                .map(ImageTag::new)
                .collect(Collectors.toSet());
        var tagsToAdd = tags.stream()
                .map(t -> existingTags.stream().filter(tag -> tag.getName().equals(t)).findFirst().orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        var savedTags = imageTagRepository.saveAll(tagsToSave);
        var resultSet = new HashSet<ImageTag>();
        resultSet.addAll(tagsToAdd);
        resultSet.addAll(savedTags);
        return resultSet;
    }

    private static byte[] writeWebp(final BufferedImage image) throws IOException {
        var bos = new ByteArrayOutputStream();
        ImageIO.write(image, "webp", bos);
        return bos.toByteArray();
    }

    private static Optional<Map<String, UploadMetadata>> readMetadata(Optional<File> zipDir) {
        if (zipDir.isEmpty()) {
            return Optional.empty();
        }
        try {
            var metadataFile = new File(Paths.get(zipDir.get().getPath(), "al-metadata.json").toString());
            var om = new ObjectMapper();
            var typeRef = new TypeReference<HashMap<String, UploadMetadata>>() {};
            var result = om.readValue(metadataFile, typeRef);
            return Optional.of(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private static Optional<File> extractZip(Optional<File> file, String uuid, ArtLibraryConfig config) {
        if (file.isEmpty()) {
            return Optional.empty();
        }
        try {
            var tempDir = config.getTempDirectory();
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

    private static Optional<File> writeMultipartToDisk(MultipartFile multipartFile, String uuid, ArtLibraryConfig config) {
        try {
            var tempDir = config.getTempDirectory();
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
