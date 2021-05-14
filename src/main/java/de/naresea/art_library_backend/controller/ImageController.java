package de.naresea.art_library_backend.controller;

import de.naresea.art_library_backend.model.dto.ImageDto;
import de.naresea.art_library_backend.model.dto.UploadResultDto;
import de.naresea.art_library_backend.model.entity.ImageFile;
import de.naresea.art_library_backend.model.repository.ImageRepository;
import de.naresea.art_library_backend.service.ImageImportService;
import de.naresea.art_library_backend.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(path = "api/images")
public class ImageController {

    @Autowired
    ImageRepository imageRepository;

    @Autowired
    private ImageImportService imageImportService;

    @PostMapping("/upload")
    public UploadResultDto uploadImage(@RequestParam("imageFiles") MultipartFile file) {
        var uuid = this.imageImportService.importMultipartImageZip(file);
        return new UploadResultDto(uuid);
    }

    @GetMapping("/upload/{uuid}")
    public ProgressService.ProgressReport getUploadProgress(@RequestParam("uuid") String uuid) {
        return ProgressService.getProgress(uuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @GetMapping(params = { "page", "size" })
    public Page<ImageDto> getImages(@RequestParam("page") int page, @RequestParam("size") int size) {
        var actualPageSize = Math.min(size, 100);
        var pageable = PageRequest.of(page, actualPageSize);
        return this.imageRepository.findAll(pageable).map(ImageDto::new);
    }

    @GetMapping(path = {"/search"}, params = {  "page", "size", "tags", "query" })
    public Page<ImageDto> getImagesByTags(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("tags") String[] tags,
            @RequestParam("query") String query
    ) {
        var actualPageSize = Math.min(size, 100);
        var pageable = PageRequest.of(page, actualPageSize);
        if (query.equals("any")) {
            return this.imageRepository.findByTags_NameIn(Arrays.asList(tags), pageable)
                    .map(ImageDto::new);
        }
        if (query.equals("all")) {
            return this.imageRepository.findByHasAllTags(Arrays.asList(tags), (long) tags.length, pageable)
                    .map(ImageDto::new);
        }
        if (query.equals("exact")) {
            return this.imageRepository.findByHasOnlyAllTags(Arrays.asList(tags), (long) tags.length, pageable)
                    .map(ImageDto::new);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    @GetMapping(path = { "/{imageId}" })
    public ImageDto getImage(@PathVariable("imageId") Long imageId) {
        final Optional<ImageFile> retrievedImage = imageRepository.findById(imageId);
        if (retrievedImage.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        var img = retrievedImage.get();
        return new ImageDto(img);
    }

    @GetMapping(path = {"/{imageId}/bin/{size}"})
    public void getBinaryContent(@PathVariable("imageId") Long imageId, @PathVariable("size") String size, HttpServletResponse response) throws IOException {
        final Optional<ImageFile> retrievedImage = imageRepository.findById(imageId);
        if (retrievedImage.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        var img = retrievedImage.get();
        var data = size.equals("small")
                ? img.getThumbnailSmall()
                : size.equals("medium")
                ? img.getThumbnailMedium()
                : size.equals("big")
                ? img.getThumbnailBig()
                : size.equals("raw")
                ? img.getPicByte()
                : null;
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Valid sizes: small, medium, big, raw");
        }
        response.setContentType("image/webp");
        response.getOutputStream().write(data);
    }
}
