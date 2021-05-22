package de.naresea.art_library_backend.service;

import de.naresea.art_library_backend.service.model.ImageProcessData;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Optional;

@Service
public class ImageProcessingService {

    private static final int SMALL_WIDTH_PX = 128;
    private static final int MED_WIDTH_PX = 256;
    private static final int BIG_WIDTH_PX = 512;

    @Autowired
    private HashService hashService;

    public Optional<ImageProcessData> processImage(Optional<File> imageFile) {

        if (imageFile.isEmpty()) {
            return Optional.empty();
        }

        try {
            var file = imageFile.get();

            var rawImage = Files.readAllBytes(file.toPath());
            var hash = hashService.getHashSum(rawImage);
            var bis = new ByteArrayInputStream(rawImage);
            var bufferedImage = ImageIO.read(bis);
            var webpImage = writeWebp(bufferedImage);
            var big = writeWebp(Thumbnails.of(bufferedImage).size(BIG_WIDTH_PX, BIG_WIDTH_PX).keepAspectRatio(true).asBufferedImage());
            var med = writeWebp(Thumbnails.of(bufferedImage).size(MED_WIDTH_PX, MED_WIDTH_PX).keepAspectRatio(true).asBufferedImage());
            var small = writeWebp(Thumbnails.of(bufferedImage).size(SMALL_WIDTH_PX, SMALL_WIDTH_PX).keepAspectRatio(true).asBufferedImage());
            var width = bufferedImage.getWidth();
            var height = bufferedImage.getHeight();

            var data = new ImageProcessData();
            data.setHash(hash);
            data.setWidth(width);
            data.setHeight(height);
            data.setRawImage(webpImage);
            data.setBigThumb(big);
            data.setMedThumb(med);
            data.setSmallThumb(small);

            return Optional.of(data);

        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private static byte[] writeWebp(final BufferedImage image) throws IOException {
        var bos = new ByteArrayOutputStream();
        ImageIO.write(image, "webp", bos);
        return bos.toByteArray();
    }

}
