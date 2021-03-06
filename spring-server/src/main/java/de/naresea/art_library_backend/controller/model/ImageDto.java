package de.naresea.art_library_backend.controller.model;

import de.naresea.art_library_backend.model.entity.ImageFile;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class ImageDto {
    Long id;
    String name;
    String type;
    Collection<ImageCategoryDto> categories;
    String description;
    String title;
    List<ImageTagDto> tags;

    public ImageDto(ImageFile image) {
        this.id = image.getId();
        this.name = image.getName();
        this.type = image.getType();
        this.categories = image.getCategories().stream().map(ImageCategoryDto::new).collect(Collectors.toList());
        this.tags = image.getTags().stream().map(ImageTagDto::new).collect(Collectors.toList());
        this.description = image.getDescription();
        this.title = image.getTitle();
    }
}
