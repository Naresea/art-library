package de.naresea.art_library_backend.model.repository;

import de.naresea.art_library_backend.model.entity.ImageTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ImageTagRepository extends JpaRepository<ImageTag, Long> {
    List<ImageTag> findByNameIn(Collection<String> names);
    Optional<ImageTag> findByName(String name);
}
