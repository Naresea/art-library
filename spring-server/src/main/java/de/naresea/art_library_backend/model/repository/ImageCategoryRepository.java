package de.naresea.art_library_backend.model.repository;

import de.naresea.art_library_backend.model.entity.ImageCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ImageCategoryRepository extends JpaRepository<ImageCategory, Long> {
    List<ImageCategory> findByNameIn(Collection<String> names);
    Optional<ImageCategory> findByName(String name);
}