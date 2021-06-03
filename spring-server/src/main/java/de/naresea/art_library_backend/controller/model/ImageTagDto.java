package de.naresea.art_library_backend.controller.model;

import de.naresea.art_library_backend.model.entity.ImageTag;
import lombok.Data;
import lombok.Value;

@Data
@Value
public class ImageTagDto {
    Long id;
    String name;

    public ImageTagDto(ImageTag tag) {
        this.id = tag.getId();
        this.name = tag.getName();
    }
}
