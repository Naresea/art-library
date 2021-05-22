package de.naresea.art_library_backend.config;

import org.springframework.stereotype.Service;

@Service
public class ArtLibraryConfig {

    public static String getTempDirectory() {
        var fromEnv = System.getenv("ART_LIBRARY_TMP_DIRECTORY");
        var fromProperties = System.getProperty("tmpDirectory");
        var fromDefault = "./tmp";
        return fromProperties != null
                ? fromProperties
                : fromEnv != null
                    ? fromEnv
                    : fromDefault;
    }

    public static String getSearchDirectory() {
        var fromEnv = System.getenv("ART_LIBRARY_SEARCH_DIRECTORY");
        var fromProperties = System.getProperty("searchDirectory");
        var fromDefault = "./search";
        return fromProperties != null
                ? fromProperties
                : fromEnv != null
                ? fromEnv
                : fromDefault;
    }

}
