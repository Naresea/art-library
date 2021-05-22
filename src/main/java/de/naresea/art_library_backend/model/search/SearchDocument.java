package de.naresea.art_library_backend.model.search;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchDocument {

    Long id;
    String name;
    String title;
    Collection<String> tags;
    Collection<String> categories;

}
