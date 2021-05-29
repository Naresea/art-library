package de.naresea.art_library_backend.model.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Collections;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "image_categories")
@Getter
@Setter
public class ImageCategory extends AbstractTimestampEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @Column()
    private boolean showInNavigation;

    @ManyToMany(mappedBy = "tags")
    Set<ImageFile> images = Collections.emptySet();

    public ImageCategory(String name) {
        this.name = name;
    }
}
