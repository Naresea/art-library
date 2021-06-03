package de.naresea.art_library_backend.model.repository;

import de.naresea.art_library_backend.model.entity.ImageFile;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ImageRepository extends PagingAndSortingRepository<ImageFile, Long> {
    Optional<ImageFile> findByName(String name);
    List<ImageFile> findAllByImagehashIn(Collection<String> hashes);
}
