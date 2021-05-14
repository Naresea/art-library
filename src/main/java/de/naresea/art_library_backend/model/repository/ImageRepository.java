package de.naresea.art_library_backend.model.repository;

import de.naresea.art_library_backend.model.entity.ImageFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Collection;
import java.util.Optional;

public interface ImageRepository extends PagingAndSortingRepository<ImageFile, Long> {
    Optional<ImageFile> findByName(String name);
    Page<ImageFile> findByTags_NameIn(Collection<String> tags, Pageable page);

    @Query(value = "SELECT i from ImageFile i LEFT JOIN i.tags t GROUP BY i"
        + " HAVING SUM(CASE WHEN t.name IN (:tags) THEN 1 ELSE 0 END) = :tagListSize"
    )
    Page<ImageFile> findByHasAllTags(Collection<String> tags, Long tagListSize, Pageable page);

    @Query(value = "SELECT i from ImageFile i LEFT JOIN i.tags t GROUP BY i"
            + " HAVING SUM(CASE WHEN t.name IN (:tags) THEN 1 ELSE -1 END) = :tagListSize"
    )
    Page<ImageFile> findByHasOnlyAllTags(Collection<String> tags, Long tagListSize, Pageable page);
}
