package de.naresea.art_library_backend.controller;

import de.naresea.art_library_backend.controller.model.ImageDto;
import de.naresea.art_library_backend.controller.model.ImagePage;
import de.naresea.art_library_backend.controller.model.ImageUpdateDto;
import de.naresea.art_library_backend.controller.model.UploadResultDto;
import de.naresea.art_library_backend.model.entity.ImageFile;
import de.naresea.art_library_backend.model.search.SearchDocument;
import de.naresea.art_library_backend.service.ImageCrudService;
import de.naresea.art_library_backend.service.ImageImportService;
import de.naresea.art_library_backend.service.ProgressService;
import de.naresea.art_library_backend.service.SearchService;
import de.naresea.art_library_backend.service.model.ImageUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import java.io.IOException;
import java.util.Date;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "api/images")
public class ImageController {

    @Autowired
    private ImageCrudService imageCrudService;

    @Autowired
    private SearchService searchService;

    @Autowired
    private ImageImportService imageImportService;

    @PostMapping("/upload")
    public UploadResultDto uploadImage(@RequestParam("imageFiles") MultipartFile file) {
        var uuid = this.imageImportService.importMultipartImageZip(file);
        return new UploadResultDto(uuid);
    }

    @GetMapping("/progress/{uuid}")
    public ProgressService.ProgressReport getUploadProgress(@PathVariable("uuid") String uuid) {
        return ProgressService.getProgress(uuid)
                .orElse(new ProgressService.ProgressReport(
                        1,
                        0,
                        0,
                        uuid,
                        new Date()
                ));
    }

    @GetMapping(params = { "page", "size" })
    public Page<ImageDto> getImages(@RequestParam("page") int page, @RequestParam("size") int size) {
        return this.imageCrudService.getImagePage(page, size).map(ImageDto::new);
    }

    @GetMapping(path = {"/search"}, params = {  "page", "size", "query" })
    public ImagePage searchImages(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("query") String query
    ) {
        if (query == null || query.trim().isEmpty()) {
            return new ImagePage(this.getImages(page, size));
        }

        var searchResults = searchService.search(query, page, size);
        if (searchResults.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        var results = searchResults.get();

        var images = this.imageCrudService.readImages(
                results.getContent().stream()
                        .map(SearchDocument::getId)
                        .collect(Collectors.toSet())
        );

        if (images.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return new ImagePage(results, images.get());
    }

    @GetMapping(path = { "/{imageId}" })
    public ImageDto getImage(@PathVariable("imageId") Long imageId) {
        final Optional<ImageFile> retrievedImage = imageCrudService.readImage(imageId);
        if (retrievedImage.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        var img = retrievedImage.get();
        return new ImageDto(img);
    }

    @GetMapping(path = {"/{imageId}/bin/{size}"})
    public void getBinaryContent(@PathVariable("imageId") Long imageId, @PathVariable("size") String size, HttpServletResponse response) throws IOException {
        final Optional<ImageFile> retrievedImage = imageCrudService.readImage(imageId);
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

    @PatchMapping(path = {"/{imageId}"})
    @Transactional
    public void updateMetadata(@PathVariable("imageId") Long imageId, @RequestBody ImageUpdateDto updateDto) {
        var update = new ImageUpdate(imageId, updateDto);
        imageCrudService.updateImage(update);
    }

    @DeleteMapping(path = {"/{imageId}"})
    public void deleteImage(@PathVariable("imageId") Long imageId) {
        imageCrudService.deleteImage(imageId);
    }

    @PostMapping(path = {"/update-search-index"})
    public void updateSearchIndex() {
        this.imageCrudService.updateSearchIndex();
    }
}
