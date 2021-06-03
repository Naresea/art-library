package de.naresea.art_library_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

@ConfigurationProperties(prefix = "art-library")
@Service
@Getter
@Setter
public class ArtLibraryConfig {

    String tmpDirectory;

    String searchDirectory;

    int numImportThreads;
}
