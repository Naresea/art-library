package de.naresea.art_library_backend.controller.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.util.Collection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Jacksonized
@Builder()
public class ImageUpdateDto {
    Collection<String> categories;
    String description;
    String title;
    Collection<String> tags;

    public ImageUpdateDto(ImageUpdateDto src) {
        this.categories = src.categories;
        this.description = src.description;
        this.title = src.title;
        this.tags = src.getTags();
    }
}
