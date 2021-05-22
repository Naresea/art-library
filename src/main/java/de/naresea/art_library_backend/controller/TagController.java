package de.naresea.art_library_backend.controller;

import de.naresea.art_library_backend.controller.model.ImageTagDto;
import de.naresea.art_library_backend.model.repository.ImageTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "api/tags")
public class TagController {

    @Autowired
    ImageTagRepository tagRepository;

    @GetMapping()
    public List<ImageTagDto> getTags() {
        return this.tagRepository.findAll().stream().map(ImageTagDto::new).collect(Collectors.toList());
    }

}
