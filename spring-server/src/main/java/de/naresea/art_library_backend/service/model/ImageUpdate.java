package de.naresea.art_library_backend.service.model;

import de.naresea.art_library_backend.controller.model.ImageUpdateDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ImageUpdate extends ImageUpdateDto {
    Long id;

    public ImageUpdate(Long id, ImageUpdateDto dto) {
        super(dto);
        this.id = id;
    }
}
