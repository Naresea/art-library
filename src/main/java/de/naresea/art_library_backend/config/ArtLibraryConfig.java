package de.naresea.art_library_backend.config;

import org.springframework.stereotype.Service;

@Service
public class ArtLibraryConfig {

    public String getTempDirectory() {
        var fromEnv = System.getenv("ART_LIBRARY_TMP_DIRECTORY");
        var fromProperties = System.getProperty("tmpDirectory");
        var fromDefault = "./tmp";
        return fromProperties != null
                ? fromProperties
                : fromEnv != null
                    ? fromEnv
                    : fromDefault;
    }

}
