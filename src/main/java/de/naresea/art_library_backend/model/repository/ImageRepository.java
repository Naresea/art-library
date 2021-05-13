package de.naresea.art_library_backend.model.repository;

import de.naresea.art_library_backend.model.entity.ImageFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImageRepository extends JpaRepository<ImageFile, Long> {

    Optional<ImageFile> findByName(String name);

}
