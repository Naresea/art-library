package de.naresea.art_library_backend.service;

import de.naresea.art_library_backend.model.entity.ImageFile;
import de.naresea.art_library_backend.model.entity.ImageTag;
import de.naresea.art_library_backend.model.repository.ImageRepository;
import de.naresea.art_library_backend.model.repository.ImageTagRepository;
import de.naresea.art_library_backend.model.search.SearchDocument;
import de.naresea.art_library_backend.service.model.ImageCreate;
import de.naresea.art_library_backend.service.model.ImageProcessData;
import de.naresea.art_library_backend.service.model.ImageUpdate;
import de.naresea.art_library_backend.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ImageCrudService {

    @Autowired
    private ImageProcessingService processingService;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private ImageTagRepository tagRepository;

    @Autowired
    private SearchService searchService;

    public void updateSearchIndex() {
        var images = Utils.toList(this.imageRepository.findAll());
        var data = images.stream()
                .map(this::mapImageFileToSearchDocument)
                .collect(Collectors.toList());
        this.searchService.updateIndex(data);
    }

    public Page<ImageFile> getImagePage(int page, int size) {
        var actualPageSize = Math.min(size, 100);
        var pageable = PageRequest.of(page, actualPageSize);
        return this.imageRepository.findAll(pageable);
    }

    public Optional<ImageFile> createImage(ImageCreate image) {
        var result = this.createImages(Collections.singletonList(image));
        return result.map(imageFiles -> imageFiles.get(0));
    }

    public Optional<ImageFile> readImage(Long id) {
        var result = this.readImages(Collections.singletonList(id));
        return result.map(imageFiles -> imageFiles.get(0));
    }

    public Optional<ImageFile> updateImage(ImageUpdate image) {
        var result = this.updateImages(Collections.singletonList(image));
        return result.map(imageFiles -> imageFiles.get(0));
    }

    public Optional<ImageFile> deleteImage(Long id) {
        var result = this.deleteImages(Collections.singletonList(id));
        return result.map(imageFiles -> imageFiles.get(0));
    }

    public Optional<List<ImageFile>> createImages(Collection<ImageCreate> images) {
        return this.createImages(images, null);
    }

    public Optional<List<ImageFile>> createImages(Collection<ImageCreate> images, String uuid) {
        var tags = this.ensureTagsCreate(images);

        var success = new AtomicInteger(0);
        var failed = new AtomicInteger(0);
        var total = images.size();

        var resultList = images.parallelStream()
                .map(i -> {
                    var processData = this.processingService.processImage(i.getImageFile());
                    return this.getCreateImage(i, processData, tags).orElse(null);
                })
                .map(createImage -> {
                    try {
                        var saved = this.imageRepository.save(createImage);
                        var suc = success.incrementAndGet();
                        var fail = failed.get();
                        if (uuid != null) {
                            ProgressService.reportProgress(total, suc, fail, uuid);
                        }
                        this.addToSearch(Collections.singletonList(saved));
                        return saved;
                    } catch (Exception e) {
                        e.printStackTrace();
                        var suc = success.get();
                        var fail = failed.incrementAndGet();
                        if (uuid != null) {
                            ProgressService.reportProgress(total, suc, fail, uuid);
                        }
                        return null;
                    }
                }).filter(Objects::nonNull).collect(Collectors.toList());
        return Optional.of(resultList);

        /*
        var processedImages = images.parallelStream().map(i -> {
            var processData = this.processingService.processImage(i.getImageFile());
            return this.getCreateImage(i, processData, tags).orElse(null);
        }).filter(Objects::nonNull).collect(Collectors.toList());

        var hashSet = new HashSet<String>();
        var cleanedList = new ArrayList<ImageFile>(processedImages.size());
        for (var processed: processedImages) {
            if (hashSet.contains(processed.getImagehash())) {
                System.err.println("Found duplicate file in upload, skipping: " + processed.getTitle());
            } else {
                hashSet.add(processed.getImagehash());
                cleanedList.add(processed);
            }
        }

        var hashes = cleanedList.stream().map(ImageFile::getImagehash).collect(Collectors.toSet());
        var duplicates = this.imageRepository.findAllByImagehashIn(hashes)
                .stream()
                .map(ImageFile::getImagehash)
                .collect(Collectors.toSet());

        var groups = cleanedList.stream().collect(Collectors.partitioningBy(i -> duplicates.contains(i.getImagehash())));
        var toSave = groups.get(false);
        var toLog = groups.get(true);

        if (!toLog.isEmpty()) {
            System.err.println("Skipping upload of duplicate image files: " + toLog.stream().map(ImageFile::getTitle).collect(Collectors.toList()));
        }

        var save = Utils.toList(this.imageRepository.saveAll(toSave));
        this.addToSearch(save);
        return Optional.of(save);*/
    }

    public Optional<List<ImageFile>> readImages(Collection<Long> ids) {
        var resultSet = this.imageRepository.findAllById(ids);
        var list = new ArrayList<ImageFile>();
        resultSet.forEach(list::add);
        return Optional.of(list);
    }

    public Optional<List<ImageFile>> updateImages(Collection<ImageUpdate> imageFiles) {
        var ids = imageFiles.stream().map(ImageUpdate::getId).collect(Collectors.toList());
        var images = Utils.toMap(this.imageRepository.findAllById(ids), ImageFile::getId);
        var tags = this.ensureTagsUpdate(imageFiles);

        var updates = imageFiles.stream()
                .map(imageUpdate -> this.mapUpdate(images, tags, imageUpdate).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        var updated = Utils.toList(this.imageRepository.saveAll(updates));
        this.updateToSearch(updated);
        return Optional.of(updated);
    }

    public Optional<List<ImageFile>> deleteImages(Collection<Long> imageIds) {
        var existingImages = Utils.toList(this.imageRepository.findAllById(imageIds));
        this.imageRepository.deleteAll(existingImages);
        this.deleteFromSearch(existingImages);
        return Optional.of(existingImages);
    }

    // ------------------- Private Methods --------------------- //

    private void addToSearch(Collection<ImageFile> images) {
        images.forEach(i -> this.searchService.addDocument(this.mapImageFileToSearchDocument(i)));
    }

    private void updateToSearch(Collection<ImageFile> images) {
        images.forEach(i -> this.searchService.updateDocument(this.mapImageFileToSearchDocument(i)));
    }

    private void deleteFromSearch(Collection<ImageFile> images) {
        images.forEach(i -> this.searchService.deleteDocument(i.getId()));
    }

    private SearchDocument mapImageFileToSearchDocument(ImageFile imageFile) {
        var doc = new SearchDocument();
        doc.setName(imageFile.getName());
        doc.setId(imageFile.getId());
        doc.setTags(imageFile.getTags().stream().map(ImageTag::getName).collect(Collectors.toSet()));
        doc.setCategories(Collections.singletonList(imageFile.getCategory()));
        doc.setTitle(imageFile.getTitle());
        return doc;
    }

    private Optional<ImageFile> getCreateImage(ImageCreate i, Optional<ImageProcessData> processData, Map<String, ImageTag> tags) {
        if (i == null || tags == null) {
            return Optional.empty();
        }

        var dbTags = i.getTags().stream()
                .map(tags::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        var basicImageFile = new ImageFile();
        basicImageFile.setTitle(i.getTitle());
        basicImageFile.setDescription(i.getDescription());
        basicImageFile.setName(i.getName());
        basicImageFile.setType(i.getType());
        basicImageFile.setTags(dbTags);
        basicImageFile.setCategory(i.getCategory());

        if (processData.isPresent()) {
            var data = processData.get();
            basicImageFile.setPicByte(data.getRawImage());
            basicImageFile.setThumbnailBig(data.getBigThumb());
            basicImageFile.setThumbnailMedium(data.getMedThumb());
            basicImageFile.setThumbnailSmall(data.getSmallThumb());
            basicImageFile.setImagehash(data.getHash());
        }

        return Optional.of(basicImageFile);
    }

    private Optional<ImageFile> mapUpdate(Map<Long, ImageFile> images, Map<String, ImageTag> tags, ImageUpdate imageUpdate) {
        var img = images.get(imageUpdate.getId());
        if (img == null) {
            return Optional.empty();
        }
        var tagsForImg = imageUpdate.getTags().stream()
                .map(tags::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        img.setTags(new HashSet<>(tagsForImg));
        img.setCategory(imageUpdate.getCategory());
        img.setTitle(imageUpdate.getTitle());
        img.setDescription(imageUpdate.getDescription());
        return Optional.of(img);
    }

    private Map<String, ImageTag> ensureTagsCreate(Collection<ImageCreate> imageFiles) {
        var tags = Utils.flatten(imageFiles.stream().map(ImageCreate::getTags).collect(Collectors.toList()));
        return ensureTags(tags);
    }

    private Map<String, ImageTag> ensureTagsUpdate(Collection<ImageUpdate> imageFiles) {
        var tags = Utils.flatten(imageFiles.stream().map(ImageUpdate::getTags).collect(Collectors.toList()));
        return ensureTags(tags);
    }

    @Transactional
    private Map<String, ImageTag> ensureTags(List<String> tags) {
        var uniqueTags = new HashSet<>(tags);
        var existingTags = Utils.toMap(this.tagRepository.findByNameIn(uniqueTags), ImageTag::getName);
        var tagsToAdd = uniqueTags.stream().filter(t ->
                !existingTags.containsKey(t)
        ).map(ImageTag::new).collect(Collectors.toList());
        this.tagRepository.saveAll(tagsToAdd).forEach(t -> existingTags.put(t.getName(), t));
        return existingTags;
    }
}
