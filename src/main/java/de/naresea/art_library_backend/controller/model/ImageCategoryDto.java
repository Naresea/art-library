package de.naresea.art_library_backend.controller.model;

import de.naresea.art_library_backend.model.entity.ImageCategory;
import lombok.Data;
import lombok.Value;

@Data
@Value
public class ImageCategoryDto {
    Long id;
    String name;

    public ImageCategoryDto(ImageCategory category) {
        this.id = category.getId();
        this.name = category.getName();
    }
}
