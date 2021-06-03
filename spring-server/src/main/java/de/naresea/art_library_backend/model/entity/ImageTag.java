package de.naresea.art_library_backend.model.entity;

import lombok.*;

import javax.persistence.*;
import java.util.Collections;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "image_tags")
@Getter
@Setter
public class ImageTag extends AbstractTimestampEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "tags")
    Set<ImageFile> images = Collections.emptySet();

    public ImageTag(String name) {
        this.name = name;
    }
}
