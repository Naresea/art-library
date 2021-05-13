package de.naresea.art_library_backend.model.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.Set;

@Entity
@Table(name = "image_files")
@NoArgsConstructor
@Data
public class ImageFile {

    public ImageFile(String name, String type, byte[] picByte) {
        this.name = name;
        this.type = type;
        this.picByte = picByte;
    }

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @ManyToMany
    @JoinTable(
            name = "image_image_tag",
            joinColumns = @JoinColumn(name = "image_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<ImageTag> tags;

    @Lob
    @Type(type = "org.hibernate.type.BinaryType")
    @Column(name = "picByte")
    private byte[] picByte;
}