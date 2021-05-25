package de.naresea.art_library_backend.model.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "image_files")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ImageFile extends AbstractTimestampEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "title")
    private String title;

    @Column(name = "type")
    private String type;

    @Column(name = "description", length = 4096)
    private String description;

    /* Hash of the original image file (not the converted webp in the database) to avoid duplicate uploads */
    @Column(name = "imagehash", unique = true, nullable = false)
    private String imagehash;

    @ManyToMany
    @JoinTable(
            name = "image_image_tag",
            joinColumns = @JoinColumn(name = "image_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<ImageTag> tags = Collections.emptySet();

    @ManyToMany
    @JoinTable(
            name = "image_image_category",
            joinColumns = @JoinColumn(name = "image_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<ImageCategory> categories = Collections.emptySet();

    @Lob
    @Type(type = "org.hibernate.type.BinaryType")
    @Column(name = "picByte")
    private byte[] picByte;


    @Lob
    @Type(type = "org.hibernate.type.BinaryType")
    @Column(name = "thumb_small")
    private byte[] thumbnailSmall;

    @Lob
    @Type(type = "org.hibernate.type.BinaryType")
    @Column(name = "thumb_medium")
    private byte[] thumbnailMedium;

    @Lob
    @Type(type = "org.hibernate.type.BinaryType")
    @Column(name = "thumb_big")
    private byte[] thumbnailBig;

    public ImageFile(String name, String type, byte[] picByte) {
        this.name = name;
        this.type = type;
        this.picByte = picByte;
    }
}