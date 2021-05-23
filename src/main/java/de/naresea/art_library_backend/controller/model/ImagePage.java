package de.naresea.art_library_backend.controller.model;

import de.naresea.art_library_backend.model.entity.ImageFile;
import de.naresea.art_library_backend.model.search.SearchDocument;
import de.naresea.art_library_backend.service.model.ElementPage;
import org.springframework.data.domain.Page;

import java.util.Collection;
import java.util.stream.Collectors;

public class ImagePage extends ElementPage<ImageDto> {

    public ImagePage(ElementPage<SearchDocument> data, Collection<ImageFile> content) {
        this.setEmpty(data.isEmpty());
        this.setFirst(data.isFirst());
        this.setLast(data.isLast());
        this.setNumber(data.getNumber());
        this.setNumberOfElements(data.getNumberOfElements());
        this.setSize(data.getSize());
        this.setTotalElements(data.getTotalElements());
        this.setTotalPages(data.getTotalPages());
        this.setContent(content.stream().map(ImageDto::new).collect(Collectors.toList()));
    }

    public ImagePage(Page<ImageDto> page) {
        this.setEmpty(page.isEmpty());
        this.setFirst(page.isFirst());
        this.setLast(page.isLast());
        this.setNumber(page.getNumber());
        this.setNumberOfElements(page.getNumberOfElements());
        this.setSize(page.getSize());
        this.setTotalElements((int) page.getTotalElements());
        this.setTotalPages(page.getTotalPages());
        this.setContent(page.getContent());
    }
}
