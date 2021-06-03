package de.naresea.art_library_backend.service.model;

import lombok.Data;

@Data
public class ImageProcessData {
    byte[] rawImage;
    byte[] bigThumb;
    byte[] medThumb;
    byte[] smallThumb;
    int width;
    int height;
    String hash;
}
