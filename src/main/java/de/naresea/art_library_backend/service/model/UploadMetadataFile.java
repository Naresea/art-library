package de.naresea.art_library_backend.service.model;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@Builder
@Jacksonized
public class UploadMetadataFile {
    List<String> tags;
    List<String> categories;
}
