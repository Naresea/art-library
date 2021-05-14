package de.naresea.art_library_backend.controller;

import de.naresea.art_library_backend.model.entity.ImageFile;
import de.naresea.art_library_backend.model.repository.ImageRepository;
import net.lingala.zip4j.ZipFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Optional;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(path = "api/images")
public class ImageController {

    @Autowired
    ImageRepository imageRepository;

    @PostMapping("/upload")
    public void uploadImage(@RequestParam("imageFiles") MultipartFile file) throws IOException {
        System.out.println("Original Image Byte Size - " + file.getSize());

        var tempFile = new File("./tmp/temp.zip");
        InputStream initialStream = file.getInputStream();
        byte[] buffer = new byte[initialStream.available()];
        initialStream.read(buffer);

        try (OutputStream os = new FileOutputStream(tempFile)) {
            os.write(buffer);
        }

        var zipFile = new ZipFile(tempFile);
        zipFile.extractAll("./tmp/extract");
        /*ImageFile img = new ImageFile(file.getOriginalFilename(), file.getContentType(),
                compressBytes(file.getBytes()));
        var result = imageRepository.save(img);
        System.out.println("Save is done, result = " + result.getName());*/
    }

    @GetMapping(path = { "/get/{imageName}" })
    public ImageFile getImage(@PathVariable("imageName") String imageName) throws IOException {
        final Optional<ImageFile> retrievedImage = imageRepository.findByName(imageName);
        ImageFile img = new ImageFile(retrievedImage.get().getName(), retrievedImage.get().getType(),
                decompressBytes(retrievedImage.get().getPicByte()));
        return img;
    }
    // compress the image bytes before storing it in the database
    public static byte[] compressBytes(byte[] data) {
        Deflater deflater = new Deflater();
        deflater.setInput(data);
        deflater.finish();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[1024];
        while (!deflater.finished()) {
            int count = deflater.deflate(buffer);
            outputStream.write(buffer, 0, count);
        }
        try {
            outputStream.close();
        } catch (IOException e) {
        }
        System.out.println("Compressed Image Byte Size - " + outputStream.toByteArray().length);
        return outputStream.toByteArray();
    }
    // uncompress the image bytes before returning it to the angular application
    public static byte[] decompressBytes(byte[] data) {
        Inflater inflater = new Inflater();
        inflater.setInput(data);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[1024];
        try {
            while (!inflater.finished()) {
                int count = inflater.inflate(buffer);
                outputStream.write(buffer, 0, count);
            }
            outputStream.close();
        } catch (IOException ioe) {
        } catch (DataFormatException e) {
        }
        return outputStream.toByteArray();
    }

}
