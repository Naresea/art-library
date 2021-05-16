package de.naresea.art_library_backend.model.dto;

import de.naresea.art_library_backend.model.entity.ImageFile;
import lombok.Data;
import lombok.Value;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Value
public class ImageDto {
    Long id;
    String name;
    String type;
    String category;
    String description;
    String title;
    List<ImageTagDto> tags;

    public ImageDto(ImageFile image) {
        this.id = image.getId();
        this.name = image.getName();
        this.type = image.getType();
        this.category = image.getCategory();
        this.tags = image.getTags().stream().map(ImageTagDto::new).collect(Collectors.toList());
        this.description = image.getDescription();
        this.title = image.getTitle();
    }
}
