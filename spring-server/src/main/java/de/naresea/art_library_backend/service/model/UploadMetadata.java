package de.naresea.art_library_backend.service.model;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;
import java.util.Map;

@Data
@Jacksonized
@Builder
public class UploadMetadata {
    List<String> tags;
    List<String> categories;
    String description;
    Map<String, UploadMetadataFile> files;
}
