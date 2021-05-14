package de.naresea.art_library_backend.model.dto;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@Jacksonized
@Builder
public class UploadMetadata {
    List<String> tags;
}
