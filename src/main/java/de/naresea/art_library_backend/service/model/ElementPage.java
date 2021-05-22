package de.naresea.art_library_backend.service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Jacksonized
public class ElementPage<T> {
    boolean empty;
    boolean first;
    boolean last;
    int number;
    int numberOfElements;
    int totalPages;
    int totalElements;
    int size;
    List<T> content;
}
