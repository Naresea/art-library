package de.naresea.art_library_backend.service.model;

import lombok.Data;

import java.io.File;
import java.util.Collection;
import java.util.Optional;

@Data
public class ImageCreate {
    String name;
    String type;
    String category;
    String description;
    String title;
    Collection<String> tags;
    Optional<File> imageFile;
}
