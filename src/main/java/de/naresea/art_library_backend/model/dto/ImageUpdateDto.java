package de.naresea.art_library_backend.model.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.Collection;

@Data
@Value
@Jacksonized
@Builder
public class ImageUpdateDto {
    String category;
    String description;
    String title;
    Collection<String> tags;
}
